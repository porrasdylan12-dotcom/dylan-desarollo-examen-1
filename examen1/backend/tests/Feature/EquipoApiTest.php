<?php

use App\Models\Categoria;
use App\Models\Equipo;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Sanctum::actingAs(User::factory()->create());
});

it('crea un equipo y responde 201 con el encabezado Location', function () {
    $categoria = Categoria::factory()->create();

    $respuesta = $this->postJson('/api/equipos', [
        'codigo' => 'EQ-0001',
        'nombre' => 'Laptop de prueba',
        'categoria_id' => $categoria->id,
        'fecha_adquisicion' => '2026-01-10',
        'costo_interno' => 125000,
    ]);

    $respuesta->assertCreated()
        ->assertHeader('Location')
        ->assertJsonPath('data.codigo', 'EQ-0001');
});

it('rechaza un equipo con datos inválidos y responde 422 con errores por campo', function () {
    $this->postJson('/api/equipos', [
        'codigo' => 'equipo-invalido',
        'nombre' => 'X',
        'categoria_id' => 9999,
        'fecha_adquisicion' => '2099-01-01',
        'costo_interno' => -1,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['codigo', 'nombre', 'categoria_id', 'fecha_adquisicion', 'costo_interno']);
});

it('impide eliminar un equipo prestado y responde 409', function () {
    $equipo = Equipo::factory()->prestado()->create();

    $this->deleteJson("/api/equipos/{$equipo->id}")
        ->assertStatus(409)
        ->assertJson([
            'mensaje' => 'No se puede eliminar un equipo prestado.',
            'codigo' => 'REGLA_NEGOCIO',
        ]);

    expect(Equipo::find($equipo->id))->not->toBeNull();
});
