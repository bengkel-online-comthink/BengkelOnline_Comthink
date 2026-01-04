const statusNames = {
    pending: 'Menunggu',
    confirmed: 'Terkonfirmasi',
    'in-progress': 'Dalam Proses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
};
const serviceNames = {
    'service-rutin': 'Service Rutin',
    'perbaikan-mesin': 'Perbaikan Mesin',
    'ganti-oli': 'Ganti Oli',
    'ganti-ban': 'Ganti Ban',
    'tune-up': 'Tune Up',
    'service-ac': 'Service AC',
    'lainnya': 'Lainnya'
};

const vehicleNames = {
    'motor': 'Motor',
    'mobil': 'Mobil',
    'truk': 'Truk',
    'bus': 'Bus'
};
let editingBookingId = null;


function loadAdminBookings() {
    const table = document.getElementById("adminBookingTable");
    if (!table) return;
    table.innerHTML = "";

    if (AppState.bookings.length === 0) {
        table.innerHTML = `<tr><td colspan="8">Tidak ada booking</td></tr>`;
        return;
    }

    AppState.bookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((b, i) => {

            const isEditing = editingBookingId === b.id;

            table.innerHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${b.userName}</td>
                <td>
                ${isEditing
                        ? `
                        <select id="vehicleType-${b.id}">
                            ${Object.keys(vehicleNames).map(s =>
                                `<option value="${s}" ${s === b.vehicleType ? 'selected' : ''}>
                                    ${vehicleNames[s]}
                                </option>`
                            ).join('')}
                        </select>
                        `
                        : vehicleNames[b.vehicleType]}
                </td>
                <td>${b.licensePlate}</td>

                <td>
                    ${isEditing
                        ? `
                        <select id="serviceType-${b.id}">
                            ${Object.keys(serviceNames).map(s =>
                                `<option value="${s}" ${s === b.serviceType ? 'selected' : ''}>
                                    ${serviceNames[s]}
                                </option>`
                            ).join('')}
                        </select>
                        `
                        : serviceNames[b.serviceType]}
                </td>

                <td>
                    ${isEditing
                        ? `<input type="date" id="date-${b.id}" value="${b.bookingDate}">`
                        : b.bookingDate}
                </td>

                <td>
                    ${isEditing
                        ? `
                        <select id="status-${b.id}">
                            ${Object.keys(statusNames).map(s =>
                                `<option value="${s}" ${s === b.status ? 'selected' : ''}>
                                    ${statusNames[s]}
                                </option>`
                            ).join('')}
                        </select>
                        `
                        : `<span class="status-badge status-${b.status}">
                            ${statusNames[b.status]}
                           </span>`
                    }
                </td>

                <td>
                    ${isEditing
                        ? `
                        <button class="action-btn btn-save" onclick="saveEdit('${b.id}')">Save</button>
                        <button class="action-btn btn-cancel" onclick="cancelEdit()">Cancel</button>
                        `
                        : `
                        <button class="action-btn btn-edit" onclick="editBooking('${b.id}')">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteBooking('${b.id}')">Hapus</button>
                        `
                    }
                </td>
            </tr>
            `;
        });
}

function editBooking(id) {
    editingBookingId = id;
    loadAdminBookings();
}

function saveEdit(id) {
    const booking = AppState.bookings.find(b => b.id === id);

    booking.vehicleType = document.getElementById(`vehicleType-${id}`).value;
    booking.serviceType = document.getElementById(`serviceType-${id}`).value;
    booking.bookingDate = document.getElementById(`date-${id}`).value;
    booking.status = document.getElementById(`status-${id}`).value;
    booking.updatedAt = new Date().toISOString();

    editingBookingId = null;
    saveBookingsData();
    loadAdminBookings();
}

function cancelEdit() {
    editingBookingId = null;
    loadAdminBookings();
}

document.addEventListener("DOMContentLoaded", () => {
    if (!AppState.currentUser || AppState.currentUser.id !== 'admin') {
        alert("Akses ditolak! Halaman khusus admin.");
        window.location.href = 'home.html';
        return;
    }

    loadAdminBookings();
});

function deleteBooking(id) {
    if (!confirm("Yakin ingin menghapus booking ini?")) return;

    AppState.bookings = AppState.bookings.filter(b => b.id !== id);
    saveBookingsData();
    loadAdminBookings();
}

function saveBookingsData() {
    localStorage.setItem('bengkel_bookings', JSON.stringify(AppState.bookings));
}