<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;
class EquipoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'estado' => $this->estado,
            'fecha_adquisicion' => $this->fecha_adquisicion?->toDateString(),
            'categoria' => $this->whenLoaded('categoria', fn () => new CategoriaResource($this->categoria)),
        ];
    }
}
