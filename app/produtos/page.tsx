"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: number;
  categoria_id: number;
  nome: string;
  descricao: string | null;
  tamanho: string | null;
  preco: number;
  destaque: boolean;
  ativo: boolean;
};

type Categoria = {
  id: number;
  nome: string;
};

const moeda = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");
  const [ordem, setOrdem] = useState("nome");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true);
      setErro("");

      const [resultadoProdutos, resultadoCategorias] = await Promise.all([
        supabase
          .from("produtos")
          .select(
            "id, categoria_id, nome, descricao, tamanho, preco, destaque, ativo"
          )
          .order("nome"),
        supabase
          .from("categorias")
          .select("id, nome")
          .eq("ativa", true)
          .order("ordem"),
      ]);

      if (resultadoProdutos.error || resultadoCategorias.error) {
        setErro(
          resultadoProdutos.error?.message ??
            resultadoCategorias.error?.message ??
            "Não foi possível carregar os dados."
        );
      } else {
        setProdutos(resultadoProdutos.data ?? []);
        setCategorias(resultadoCategorias.data ?? []);
      }

      setCarregando(false);
    }

    carregarDados();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const resultado = produtos.filter((produto) => {
      const correspondeBusca =
        produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (produto.descricao ?? "").toLowerCase().includes(busca.toLowerCase());

      const correspondeCategoria =
        categoriaSelecionada === "todas" ||
        produto.categoria_id === Number(categoriaSelecionada);

      return correspondeBusca && correspondeCategoria;
    });

    if (ordem === "menor-preco") {
      resultado.sort((a, b) => a.preco - b.preco);
    } else if (ordem === "maior-preco") {
      resultado.sort((a, b) => b.preco - a.preco);
    } else {
      resultado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }

    return resultado;
  }, [produtos, busca, categoriaSelecionada, ordem]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="text-xl font-bold text-orange-400">
            🍕 Sabor da Gente
          </Link>

          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-zinc-300 hover:bg-white/10"
            >
              Painel inicial
            </Link>
            <Link
              href="/produtos"
              className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white"
            >
              Produtos
            </Link>
            <Link
              href="/pedidos"
              className="rounded-lg px-4 py-2 text-zinc-300 hover:bg-white/10"
            >
              Pedidos
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-400">
              Cardápio
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Gerenciar produtos
            </h1>
            <p className="mt-2 text-zinc-400">
              Consulte, pesquise e organize os produtos da pizzaria.
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Vamos habilitar o cadastro no próximo passo."
            className="cursor-not-allowed rounded-xl bg-orange-500/40 px-5 py-3 font-semibold text-white/70"
          >
            + Novo produto
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Produtos cadastrados</p>
            <p className="mt-2 text-3xl font-bold">{produtos.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Produtos ativos</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {produtos.filter((produto) => produto.ativo).length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">Categorias</p>
            <p className="mt-2 text-3xl font-bold">{categorias.length}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-4 md:grid-cols-3">
          <input
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            placeholder="Pesquisar produto..."
            aria-label="Pesquisar produto"
            className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-400"
          />

          <select
            value={categoriaSelecionada}
            onChange={(evento) => setCategoriaSelecionada(evento.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-400"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={String(categoria.id)}>
                {categoria.nome}
              </option>
            ))}
          </select>

          <select
            value={ordem}
            onChange={(evento) => setOrdem(evento.target.value)}
            aria-label="Ordenar produtos"
            className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-400"
          >
            <option value="nome">Ordem alfabética</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
          </select>
        </div>

        {carregando && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">
            Carregando produtos...
          </div>
        )}

        {erro && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-5 text-red-300">
            <p className="font-semibold">Não foi possível carregar os produtos.</p>
            <p className="mt-2 break-words text-sm">{erro}</p>
          </div>
        )}

        {!carregando && !erro && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Lista de produtos</h2>
              <span className="text-sm text-zinc-400">
                {produtosFiltrados.length} resultado(s)
              </span>
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center">
                <p className="font-semibold">Nenhum produto encontrado.</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Tente alterar a pesquisa ou selecionar outra categoria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-zinc-900 text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Produto</th>
                      <th className="px-5 py-4 font-medium">Tamanho</th>
                      <th className="px-5 py-4 font-medium">Preço</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-zinc-900/50">
                    {produtosFiltrados.map((produto) => (
                      <tr
                        key={produto.id}
                        className="transition hover:bg-white/5"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">{produto.nome}</p>
                          {produto.descricao && (
                            <p className="mt-1 max-w-md text-xs text-zinc-400">
                              {produto.descricao}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-zinc-300">
                          {produto.tamanho ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-orange-300">
                          {moeda(produto.preco)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              produto.ativo
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            {produto.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}