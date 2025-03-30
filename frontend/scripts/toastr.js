function showAlert(type, title, message) {
    const options = {
        closeButton: false,
        newestOnTop: false,
        progressBar: false,
        positionClass: "toast-bottom-right",
        preventDuplicates: true,
        showDuration: 300,
        hideDuration: 1000,
        timeOut: 3000,
        extendedTimeOut: 1000,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"
    };

    toastr.options = options;

    switch (type) {
        case "success":
            toastr.success(title, message);
            break;
        case "error":
            toastr.error(title, message);
            break;
        case "info":
            toastr.info(title, message);
            break;
        case "warning":
            toastr.warning(title, message);
            break;
        default:
            toastr.info(title, message);
    }
}
