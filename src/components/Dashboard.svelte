<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';

  export let candidatos: any[] = [];

  // --- ESTADOS DE FILTROS ---
  let busqueda = "";
  let filtroTipo = "todos";
  let filtroPartido = "todos";
  let filtroCargo = "todos";
  let filtroRiesgo = "todos";
  let orden = "riesgo_desc";
  
  // --- ESTADOS DE UI ---
  let filtrosAbiertos = false;
  let paginaActual = 1;
  const elementosPorPagina = 24;
  let elementoSentinela: HTMLElement;
  let isMounted = false; 

  // --- LISTAS DINÁMICAS ---
  const partidos = [...new Set(candidatos.map(c => c.partido))].sort();
  const cargos = [...new Set(candidatos.map(c => c.cargo))].sort();
  const tiposEleccion = [...new Set(candidatos.map(c => c.tipoEleccion))].sort();

  // --- 1. LÓGICA DE FILTRADO ---
  $: listaFiltradaTotal = candidatos
    .filter(c => {
      if (busqueda === "" && filtroTipo === "todos" && filtroPartido === "todos" && 
          filtroCargo === "todos" && filtroRiesgo === "todos") return true;

      const matchTexto = !busqueda || c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) || c.dni.includes(busqueda);
      const matchTipo = filtroTipo === "todos" || c.tipoEleccion === filtroTipo;
      const matchPartido = filtroPartido === "todos" || c.partido === filtroPartido;
      const matchCargo = filtroCargo === "todos" || c.cargo === filtroCargo;
      
      const matchRiesgo = filtroRiesgo === "todos" || 
                          (filtroRiesgo === "alto" && c.riesgo.etiqueta === "ALTO RIESGO") ||
                          (filtroRiesgo === "medio" && c.riesgo.etiqueta === "RIESGO MEDIO") ||
                          (filtroRiesgo === "confiable" && c.riesgo.etiqueta === "CONFIABLE");

      return matchTexto && matchTipo && matchPartido && matchCargo && matchRiesgo;
    })
    .sort((a, b) => {
      if (orden === "riesgo_desc") return a.riesgo.valor - b.riesgo.valor; 
      if (orden === "riesgo_asc") return b.riesgo.valor - a.riesgo.valor;
      if (orden === "az") return a.nombreCompleto.localeCompare(b.nombreCompleto);
      if (orden === "za") return b.nombreCompleto.localeCompare(a.nombreCompleto);
      return 0;
    });

  // --- 2. LÓGICA DE CORTE ---
  $: candidatosVisibles = listaFiltradaTotal.slice(0, paginaActual * elementosPorPagina);

  // --- 3. OBSERVADOR ---
  $: resetearPaginacion(busqueda, filtroTipo, filtroPartido, filtroCargo, filtroRiesgo, orden);

  function resetearPaginacion(...args) {
      if (isMounted) {
          paginaActual = 1;
          window.scrollTo({ top: 0, behavior: 'auto' });
          actualizarURL();
      }
  }

  function actualizarURL() {
      const params = new URLSearchParams();
      if (busqueda) params.set('q', busqueda);
      if (filtroTipo !== 'todos') params.set('tipo', filtroTipo);
      if (filtroPartido !== 'todos') params.set('partido', filtroPartido);
      if (filtroCargo !== 'todos') params.set('cargo', filtroCargo);
      if (filtroRiesgo !== 'todos') params.set('riesgo', filtroRiesgo);
      if (orden !== 'riesgo_desc') params.set('orden', orden);
      
      const nuevaURL = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', nuevaURL);
  }

  // --- 4. INFINITE SCROLL ---
  function cargarMas() {
      if (candidatosVisibles.length < listaFiltradaTotal.length) {
          paginaActual++;
      }
  }

  onMount(async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('q')) busqueda = params.get('q') || "";
      if (params.has('tipo')) filtroTipo = params.get('tipo') || "todos";
      if (params.has('partido')) filtroPartido = params.get('partido') || "todos";
      if (params.has('cargo')) filtroCargo = params.get('cargo') || "todos";
      if (params.has('riesgo')) filtroRiesgo = params.get('riesgo') || "todos";
      if (params.has('orden')) orden = params.get('orden') || "riesgo_desc";

      await tick();
      isMounted = true; 

      const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
              cargarMas();
          }
      }, { rootMargin: '400px' });

      setTimeout(() => {
          if (elementoSentinela) observer.observe(elementoSentinela);
      }, 100);

      return () => { if (elementoSentinela) observer.unobserve(elementoSentinela); };
  });
</script>

<div class="space-y-6 relative min-h-screen">
  
  <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-30 flex gap-3 items-center">
    <div class="relative flex-grow">
      <input type="text" bind:value={busqueda} placeholder="Buscar entre {candidatos.length} postulaciones..." class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base" />
      <svg class="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    </div>
    <button on:click={() => filtrosAbiertos = true} class="md:hidden bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center shrink-0">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
    </button>
  </div>

  {#if filtrosAbiertos}
    <div transition:fade class="fixed inset-0 bg-black/50 z-40 md:hidden" on:click={() => filtrosAbiertos = false}></div>
  {/if}

  <aside class={`fixed inset-y-0 right-0 w-80 bg-white p-6 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto md:static md:w-auto md:bg-transparent md:p-0 md:shadow-none md:z-auto md:overflow-visible ${filtrosAbiertos ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
      <div class="flex justify-between items-center mb-6 md:hidden">
        <h2 class="text-xl font-bold text-slate-800">Filtros</h2>
        <button on:click={() => filtrosAbiertos = false} class="text-slate-500"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
      </div>

      <div class="bg-white md:p-6 md:rounded-xl md:shadow-sm md:border md:border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Elección</label>
          <select bind:value={filtroTipo} class="w-full p-2.5 rounded-lg border-2 border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 outline-none font-medium">
            <option value="todos">Todos los tipos</option>
            {#each tiposEleccion as t}<option value={t}>{t}</option>{/each}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Partido Político</label>
          <select bind:value={filtroPartido} class="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:border-indigo-500 outline-none">
            <option value="todos">Todos los partidos</option>
            {#each partidos as p}<option value={p}>{p}</option>{/each}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label>
          <select bind:value={filtroCargo} class="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:border-indigo-500 outline-none">
            <option value="todos">Todos los cargos</option>
            {#each cargos as c}<option value={c}>{c}</option>{/each}
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nivel de Riesgo</label>
          <select bind:value={filtroRiesgo} class="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:border-indigo-500 outline-none">
            <option value="todos">Cualquier nivel</option>
            <option value="alto">🚨 Alto Riesgo (1-4)</option>
            <option value="medio">⚠️ Riesgo Medio (5-7)</option>
            <option value="confiable">✅ Confiables (8-10)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Ordenar por</label>
          <select bind:value={orden} class="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:border-indigo-500 outline-none">
            <option value="riesgo_desc">Mayor Riesgo primero</option>
            <option value="riesgo_asc">Mayor Confianza primero</option>
            <option value="az">Alfabético (A-Z)</option>
            <option value="za">Alfabético (Z-A)</option>
          </select>
        </div>
        <button on:click={() => filtrosAbiertos = false} class="md:hidden mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-lg">Ver Resultados</button>
      </div>
      
      <div class="hidden md:flex mt-2 justify-end text-xs text-slate-400 font-medium items-center gap-4">
          <span>{listaFiltradaTotal.length} resultados encontrados</span>
          {#if listaFiltradaTotal.length !== candidatos.length}
              <button class="text-indigo-600 hover:underline cursor-pointer" on:click={() => { filtroTipo='todos'; filtroPartido='todos'; filtroCargo='todos'; filtroRiesgo='todos'; busqueda=''; }}>Limpiar filtros</button>
          {/if}
      </div>
  </aside>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each candidatosVisibles as c (c.idUnico)}
      <article class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col relative group h-full">
        <div class={`absolute top-3 right-3 px-2 py-1 rounded-md text-[12px] font-bold text-white shadow-sm z-10 ${c.riesgo.color}`}>{c.riesgo.etiqueta}</div>
        
        <div class="p-5 flex flex-col items-center text-center border-b border-slate-100 relative">
          <div class="absolute top-3 left-3"><span class="text-[12px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">{c.tipoEleccion}</span></div>
          <div class="relative mb-3 mt-4">
            <img src={c.foto} alt={c.nombreCompleto} class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform" on:error={(e) => e.currentTarget.src='https://via.placeholder.com/150?text=Sin+Foto'} />
            <img src={c.logo} class="w-6 h-6 absolute bottom-0 right-0 rounded bg-white p-0.5 shadow-sm object-contain" alt="Logo" />
          </div>
          <h2 class="text-base font-black text-slate-800 leading-tight mb-0.5 line-clamp-1">{c.nombres}</h2>
          <h3 class="text-sm font-bold text-slate-600 mb-2 line-clamp-1">{c.apellidos}</h3>
          <div class="w-full space-y-1">
            <p class="text-[12px] font-bold text-indigo-600 bg-indigo-50 py-1 px-2 rounded uppercase tracking-wider inline-block max-w-full truncate">{c.partido}</p>
            <div class="flex flex-col items-center justify-center gap-1 mt-1 text-[12px] text-slate-500 border-t border-slate-100 pt-2 w-full"><span class="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium truncate max-w-full">{c.cargo}</span></div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 flex-grow flex flex-col justify-start"> <div class="flex justify-between items-end mb-2"><span class="text-[12px] font-bold text-slate-400 uppercase">Puntaje</span><span class={`text-xl font-black ${c.riesgo.textoColor}`}>{c.riesgo.valor}/10</span></div>
          <div class="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden"><div class={`h-full rounded-full ${c.riesgo.color}`} style={`width: ${c.riesgo.valor * 10}%`}></div></div>
          
          {#if c.riesgo.detalles.length > 0}
            <ul class="text-xs font-semibold space-y-1">
              {#each c.riesgo.detalles as detalle}
                <li class="flex items-start gap-1 text-red-700 bg-white p-1 rounded border border-red-100 text-[12px]"><span>•</span> {detalle}</li>
              {/each}
            </ul>
          {:else}
            <div class="text-[12px] text-center text-green-600 bg-green-50 p-1.5 rounded border border-green-100 font-medium">✨ Sin antecedentes.</div>
          {/if}
        </div>
        <a href={`/candidato/${c.idUnico}`} class="block text-center py-2 bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors uppercase tracking-wide mt-auto">Ver Expediente</a>
      </article>
    {/each}
  </div>

  {#if candidatosVisibles.length < listaFiltradaTotal.length}
    <div bind:this={elementoSentinela} class="py-12 flex justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
  {/if}

  {#if listaFiltradaTotal.length === 0}
    <div class="text-center py-20"><p class="text-xl text-slate-400 font-bold">No se encontraron resultados</p></div>
  {/if}
</div>