async function approve(id, username) {
    await Swal.fire({
        title: `Aprobar a ${username}`,
        html: `¿Estás seguro de que quieres aprobara a <u>${username}?</u>`,
        showCancelButton: true,
        confirmButtonText: `Aprobar`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let body = await fetch(`/api/admin/approve/${id}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' }
            });
            body = await body.json();
            if (body.success) location.reload()
            else Swal.showValidationMessage(body.message)
        }
    })
    location.reload()
}

async function deny(id, username) {
    await Swal.fire({
        title: `Denegar a ${username}`,
        html: `Ingrese una razón para denegar a <u>${username}</u>`,
        showCancelButton: true,
        input: "text",
        confirmButtonText: `Denegar`,
        showLoaderOnConfirm: true,
        preConfirm: async (reason) => {
            let body = await fetch(`/api/admin/deny/${id}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({reason})
            });
            body = await body.json();
            if (body.success) location.reload()
            else Swal.showValidationMessage(body.message)
        }
    })
    location.reload()
}

async function note(note, username) {
    await Swal.fire({
        title: `Nota para ${username}`,
        text: note,
        confirmButtonText: `Ok`
    })
}