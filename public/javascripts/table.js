$(document).ready(function() {
	$('table.striped tr:even').addClass('even');
	var rows = $('table.striped tbody tr');
	rows.mouseover(function() {
	  		$(this).addClass('highlight');
		}
	);
	rows.mouseout(function() {
	  		$(this).removeClass('highlight');
		}
	);
	}
);