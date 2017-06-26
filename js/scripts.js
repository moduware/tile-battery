var battery_state = 'unknown';

var hide = function(el) {
	document.getElementById(el).classList.add('hidden');
};
var show = function(el) {
	document.getElementById(el).classList.remove('hidden');
};

function confirmButtonHandler () {
	hide('explanation-board');
	show('battery-board');

	// if(firstPage) {
	// 	hide('onboarding-one');
	// 	show('onboarding-two');
	// 	firstPage=false;
	// } else {
	// 	hide('explanation-board');
	// 	show('battery-board');
	// }
}


//Charges the nexpaq
function chargeSwitchHandler() {
	if($checkBox.checked) {
		Nexpaq.API.Module.SendCommand(Nexpaq.Arguments[0], 'SetDischarge', []);
	} else {
		Nexpaq.API.Module.SendCommand(Nexpaq.Arguments[0], 'SetCharge', []);
	}
}

function showVoltage (value) {
	value = value.toFixed(2);
	if(battery_state != 'standby'){
		document.getElementsByClassName('voltage')[0].textContent = "Voltage is: " + value + "V";
	} else {
		document.getElementsByClassName('voltage')[0].textContent = "-";
	}
}

//Checks percentage and change the background color.
function showPercentage (percentage) {
	document.getElementsByClassName('percentage')[0].textContent = percentage +"%";

	if (percentage < 50 && percentage >= 20) {
		document.getElementsByClassName('battery-status')[0].style.backgroundColor = "#FFB931";
		Nexpaq.Header.customize({backgroundColor: '#FFB931'});
	}
	if (percentage < 20) {
		document.getElementsByClassName('battery-status')[0].style.backgroundColor = "#DF5250";
		Nexpaq.Header.customize({backgroundColor: '#DF5250'});
	}
}
function showStatus (status) {
	var state = '';
	switch(status) {
		case 'charging':
		state = 'Charging';
		$checkBox.checked = false;
		break;

		case 'discharging':
		state = 'Discharging';
		$checkBox.checked = true;
		break;

		case 'standby':
		state = 'Standby';
		$checkBox.checked = false;
		break;

		case 'full':
		state = 'Full';
		$checkBox.checked = false;
		break;

		default:
		state = 'Unknown';
		$checkBox.checked = false;
	}

	document.getElementsByClassName("status")[0].textContent = state;
}

function checkStatus() {
	Nexpaq.API.Module.SendCommand(Nexpaq.Arguments[0], 'CheckStatus', []);
}

document.addEventListener('NexpaqAPIReady', function(event) {        
  Nexpaq.API.Module.addEventListener('DataReceived', function(event) {
    // we don't care about data not related to our module
    if(event.module_uuid != Nexpaq.Arguments[0]) return;
	if(event.data_source == 'StateChangeResponse' || event.data_source == 'ChargeChangeResponse') {
		// some time required to change state
		setTimeout(function() {
			Nexpaq.API.Module.SendCommand(Nexpaq.Arguments[0], 'CheckStatus', []);
		}, 1000);
	} else if(event.data_source == 'BatteryStateResponse') {
		battery_state = event.variables.status;
		
		showStatus(event.variables.status);
		showPercentage(event.variables.percentage);
		showVoltage(event.variables.voltage);
	}
  });
  Nexpaq.API.Module.addEventListener('BatteryStateReceived', function(event) {
	// we don't care about data not related to our module
    if(event.uuid != Nexpaq.Arguments[0]) return;
	console.log(event);

	var status = event.Battery.Status.toLowerCase();

	battery_state = status;
	showStatus(status);
	showPercentage(event.Battery.Percent);
	showVoltage(event.Battery.Voltage);
  });

  checkStatus();
  setInterval(checkStatus, 20000);  
}); 


document.addEventListener("DOMContentLoaded", function(event) {
	Nexpaq.Header.create("Battery");
	//Header Customization
	header = {
		backgroundColor: '#90CF42',
		color: '#FFFFFF',
		iconColor: '#FFFFFF',
	};
	Nexpaq.Header.customize(header);
	Nexpaq.Header.hideShadow();

	firstPage=true;
	standBy=true;
	$checkBox = document.getElementById('myonoffswitch');



	$checkBox.addEventListener('click', chargeSwitchHandler);
	document.getElementById('confirm-button').addEventListener('click', confirmButtonHandler);
	
});
