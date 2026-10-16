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
  const [mensagem, setMensagem] = useState("");
  const [produtoEmAcao, setProdutoEmAcao] = useState<number | null>(null);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
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

      if (resultadoProdutos.error) throw resultadoProdutos.error;
      if (resultadoCategorias.error) throw resultadoCategorias.error;

      setProdutos(resultadoProdutos.data ?? []);
      setCategorias(resultadoCategorias.data ?? []);
    } catch (erroDesconhecido) {
      setErro(
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
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

  async function alternarStatus(produto: Produto) {
    setProdutoEmAcao(produto.id);
    setErro("");
    setMensagem("");

    try {
      const { data, error } = await supabase
        .from("produtos")
        .update({ ativo: !produto.ativo })
        .eq("id", produto.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "O banco não confirmou a alteração. Verifique as permissões de atualização."
        );
      }

      setProdutos((atuais) =>
        atuais.map((item) =>
          item.id === produto.id ? { ...item, ativo: !produto.ativo } : item
        )
      );

      setMensagem(
        produto.ativo
          ? `Produto "${produto.nome}" desativado com sucesso.`
          : `Produto "${produto.nome}" ativado com sucesso.`
      );
    } catch (erroDesconhecido) {
      setErro(
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : "Não foi possível alterar o status do produto."
      );
    } finally {
      setProdutoEmAcao(null);
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmado = window.confirm(
      `Tem certeza de que deseja excluir "${produto.nome}"? Esta ação não pode ser desfeita. Se o produto estiver vinculado a pedidos, o banco poderá impedir a exclusão.`
    );

    if (!confirmado) return;

    setProdutoEmAcao(produto.id);
    setErro("");
    setMensagem("");

    try {
      const { data, error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", produto.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "O banco não confirmou a exclusão. Verifique as permissões de exclusão."
        );
      }

      setProdutos((atuais) =>
        atuais.filter((item) => item.id !== produto.id)
      );

      setMensagem(`Produto "${produto.nome}" excluído com sucesso.`);
    } catch (erroDesconhecido) {
      setErro(
        erroDesconhecido instanceof Error
          ? `Não foi possível excluir o produto. ${erroDesconhecido.message}`
          : "Não foi possível excluir o produto. Se ele estiver associado a pedidos, tente desativá-lo."
      );
    } finally {
      setProdutoEmAcao(null);
    }
  }

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
              Consulte, pesquise, organize e gerencie os produtos da pizzaria.
            </p>
          </div>

          <Link
            href="/produtos/novo"
            className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-400"
          >
            + Novo produto
          </Link>
        </div>

        {mensagem && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300"
          >
            {mensagem}
          </div>
        )}

        {erro && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-300"
          >
            <p className="font-semibold">Ocorreu um problema</p>
            <p className="mt-2 break-words text-sm">{erro}</p>
          </div>
        )}

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

        {!carregando && erro && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-10 text-center text-zinc-400">
            Não foi possível carregar a listagem. Confira a mensagem acima e
            tente recarregar a página.
            <button
              type="button"
              onClick={() => void carregarDados()}
              className="mx-auto mt-4 block rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-400"
            >
              Tentar novamente
            </button>
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
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-zinc-900 text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Produto</th>
                      <th className="px-5 py-4 font-medium">Tamanho</th>
                      <th className="px-5 py-4 font-medium">Preço</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Ações</th>
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
                          {produto.destaque && (
                            <span className="mt-2 inline-block rounded-full bg-orange-500/15 px-2 py-1 text-xs text-orange-300">
                              Destaque
                            </span>
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
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/produtos/editar/${produto.id}`}
                              className="rounded-lg border border-sky-500/30 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/10"
                            >
                              Editar
                            </Link>
                            <button
                              type="button"
                              disabled={produtoEmAcao !== null}
                              onClick={() => void alternarStatus(produto)}
                              className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {produtoEmAcao === produto.id
                                ? "Aguarde..."
                                : produto.ativo
                                  ? "Desativar"
                                  : "Ativar"}
                            </button>
                            <button
                              type="button"
                              disabled={produtoEmAcao !== null}
                              onClick={() => void excluirProduto(produto)}
                              className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {produtoEmAcao === produto.id
                                ? "Aguarde..."
                                : "Excluir"}
                            </button>
                          </div>
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