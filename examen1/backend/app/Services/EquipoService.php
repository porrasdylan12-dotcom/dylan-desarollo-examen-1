<?php

namespace App\Services;

use App\Exceptions\ReglaNegocioException;
use App\Models\Equipo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EquipoService
{
    public function listar(?string $q, ?string $estado, int $porPagina): LengthAwarePaginator
    {
        return Equipo::with('categoria')
            ->when($q !== null && $q !== '', fn (Builder $consulta) => $consulta->where(fn (Builder $subconsulta) =>
                $subconsulta->where('codigo', 'like', "%{$q}%")
                    ->orWhere('nombre', 'like', "%{$q}%")))
            ->when($estado !== null && $estado !== '', fn (Builder $consulta) => $consulta->where('estado', $estado))
            ->orderBy('codigo')
            ->paginate($porPagina);
    }

    public function crear(array $datos): Equipo
    {
        $equipo = Equipo::create($datos);

        return $equipo->load('categoria');
    }

    public function actualizar(Equipo $equipo, array $datos): Equipo
    {
        $equipo->update($datos);

        return $equipo->load('categoria');
    }

    public function eliminar(Equipo $equipo): void
    {
        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException('No se puede eliminar un equipo prestado.');
        }

        $equipo->delete();
    }

    public function prestar(Equipo $equipo): Equipo
    {
        if ($equipo->estado === 'mantenimiento') {
            throw new ReglaNegocioException('No se puede prestar un equipo en mantenimiento.');
        }

        if ($equipo->estado === 'prestado') {
            throw new ReglaNegocioException('El equipo ya se encuentra prestado.');
        }

        $equipo->update(['estado' => 'prestado']);

        return $equipo->load('categoria');
    }
}
