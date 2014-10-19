function confirm_del_img() {
    if (confirm("Do you confirm to delete?")) {
	return true;
    } else {
	return false;
    }
}


function confirm_del_alb() {
    if (confirm("Do you confirm to delete? All images in album will be also deleted!")) {
	return true;
    } else {
	return false;
    }
}