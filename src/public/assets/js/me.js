$(document).ready(() => {
    $(document).on("click",".delete", async function () {
        await Swal.fire({
            title: `Borrando ${$(this).attr("data-name")}`,
            icon: 'warning',
            html: `Escribe <u>${$(this).attr("data-name")}</u> para confirmar`,
            showCancelButton: true,
            input: "text",
            confirmButtonText: `Borrar`,
            preConfirm: async (name) => {
                if (name.toLowerCase() !== $(this).attr("data-name").toLowerCase()) {
                    Swal.update({
                        title: "Cancelado",
                        html: ""
                    });
                    await wait(1)
                } else {
                    await fetch(`/api/bots/${$(this).attr("data-id")}`, {method: "DELETE"});
                    location.href = "/me";
                }
            }
        })
    })
})