"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: number;
  nome: string;
  tamanho: string | null;
  preco: number;
};

function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, tamanho, preco")
        .order("id");

      if (error) {
        setErro(error.message);
      } else {
        setProdutos(data ?? []);
      }
      setCarregando(false);
    }

    carregar();
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Teste de conexão com o Supabase</h1>
      <p className="mb-4 text-sm text-zinc-500">
        Esta página é temporária. Vamos trocá-la pelo painel de verdade.
      </p>

      {carregando && <p>Carregando...</p>}

      {erro && (
        <p className="rounded bg-red-100 p-3 text-red-700">Erro: {erro}</p>
      )}

      {!carregando && !erro && (
        <>
          <p className="mb-3 font-medium">{produtos.length} produtos encontrados:</p>
          <ul className="space-y-1">
            {produtos.map((p) => (
              <li key={p.id} className="flex justify-between border-b py-1">
                <span>
                  {p.nome}
                  {p.tamanho ? ` (${p.tamanho})` : ""}
                </span>
                <span>{formatarPreco(p.preco)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}