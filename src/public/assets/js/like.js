$(document).ready(async function () {
  $('#like').click(async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    let { isConfirmed } = await swalWithBootstrapButtons.fire({
      title: 'Estás seguro de que te gusta este bot?',
      text: "No podrás dar me gusta durante las próximas 12 horas..",
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Si, me gusta'
    })
    if (!isConfirmed) return;
    let botid = location.href.split(location.host)[1].replace('/bots/like/', '').replace('/', '');
    let req = await fetch(`/api/like/${botid}`, {
      method: "PATCH",
      headers: { 'Content-Type': 'application/json' }
    })
    req = await req.json()
    if (req.success) {
      await swalWithBootstrapButtons.fire({
        title: 'Éxito',
        text: 'Le has dado me gusta con éxito !',
        icon: 'success'
      })
      location.href = `/bots/${botid}`
    } else {
      let hours = 11 - Math.floor(req.time / 3600000);
      let minutes = 60 - Math.ceil((req.time  / 60000) % 60);
      await swalWithBootstrapButtons.fire({
        title: 'Error',
        text: `Tienes que esperar ${hours} horas y ${minutes} minutos`,
        icon: 'error'
      })
      location.href = `/bots/${botid}`
    }
  })
})
