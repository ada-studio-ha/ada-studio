const MODULE_VERSION = '1.0.0-beta.1';
const BLENDS = ['normal','lighten','screen','plus-lighter','overlay','soft-light','hard-light','multiply','difference'];
const ALIGNS = [
  ['start','Align left','M3,3H21V5H3V3M3,7H15V9H3V7M3,11H21V13H3V11M3,15H15V17H3V15M3,19H21V21H3V19Z'],
  ['middle','Center','M3,3H21V5H3V3M7,7H17V9H7V7M3,11H21V13H3V11M7,15H17V17H7V15M3,19H21V21H3V19Z'],
  ['end','Align right','M3,3H21V5H3V3M9,7H21V9H9V7M3,11H21V13H3V11M9,15H21V17H9V15M3,19H21V21H3V19Z']
];
const KEY    = 'ada-studio';
const FORMAT = 2;
const LEVEL = 7;
const V1_MSG = 'project from version 1.x: not supported';
const ICON_RE = /^[a-z0-9_-]+:[a-z0-9_-]+$/;
const SP_RE = /^ada_studio\.[a-z0-9_]+$/;
const SP_DOM = /^[a-z][a-z0-9_]*$/;
const SP_IN = /ada_studio\.[a-z0-9_]/;
const CLK_TD = ['time', 'date', 'date_time', 'date_time_utc', 'date_time_iso', 'time_date', 'time_utc'];
const CLK_SUN = ['solar_elevation', 'solar_azimuth', 'next_dawn', 'next_dusk', 'next_midnight', 'next_noon', 'next_rising', 'next_setting'];
const CK_M = ['sun.sun'].concat(CLK_TD.map(k => 'sensor.' + k), CLK_SUN.map(k => 'sensor.sun_' + k), ['binary_sensor.sun_solar_rising']);

const TEMPLATE = `
<style>
:host{
  display:flex; flex-direction:column; overflow:hidden; position:relative;
  /* Tutta l'altezza: un pannello personalizzato non ha la barra di HA sopra, e il
     vecchio calc(100vh - --header-height) lasciava in basso una fascia vuota. dvh segue la
     barra degli indirizzi dei browser mobili; dove non c'è vale 100vh. */
  height:100vh; height:100dvh;
  --paper: var(--secondary-background-color, #f0eeea);
  --grid: var(--divider-color, #d6d1c6);
  --chrome: var(--card-background-color, #fff);
  --chrome2: var(--secondary-background-color, #f6f4ef);
  --line: var(--divider-color, #c6c0b4);
  --ink: var(--primary-text-color, #1e2430);
  --ink2: var(--secondary-text-color, #5c6472);
  --accent: var(--primary-color, #a65e00);
  --accent-soft: color-mix(in srgb, var(--primary-color, #a65e00) 18%, transparent);
  --zone: color-mix(in srgb, var(--primary-text-color, #1e2430) 7%, transparent);
  --zone-line: var(--secondary-text-color, #8c93a1);
  color:var(--ink); background:var(--chrome);
  --guide: #00A3E0;
  --ph: #9c6ade;
  --rail-w: 0px;
  --mono: var(--ha-font-family-code, var(--code-font-family, ui-monospace, monospace));
  font-family:var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif));
  font-size:14px; line-height:1.45;
}
*,*::before,*::after{box-sizing:border-box}
button,input,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:1px}

header{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);flex:0 0 auto;flex-wrap:wrap}
header h1{font-size:14px;font-weight:600;margin:0}
/* Aggancio: interruttori a icona; la casella resta, nascosta, per tastiera e lettori. */
.snap{display:flex;align-items:center;gap:3px}
#snl{font-size:12px;color:var(--ink2);margin-right:3px}
.tg{position:relative;display:inline-flex;cursor:pointer}
.tg input{position:absolute;opacity:0;width:1px;height:1px;margin:0;pointer-events:none}
.tg span{display:flex;align-items:center;justify-content:center;width:30px;height:28px;border-radius:6px;border:1px solid var(--line);color:var(--ink2)}
.tg:hover span{background:var(--chrome2);color:var(--ink)}
.tg input:checked+span{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.tg input:focus-visible+span{outline:2px solid var(--accent);outline-offset:1px}
.tg svg{width:18px;height:18px;fill:currentColor;display:block}
.snap #gs{margin-left:2px}
@media (pointer:coarse){.tg span{width:38px;height:36px}.tg svg{width:20px;height:20px}}
.sp{flex:1}
.seg{display:flex;border:1px solid var(--line);border-radius:6px;overflow:hidden}
.seg button{background:var(--chrome2);border:0;border-right:1px solid var(--line);padding:6px 11px;cursor:pointer;font-size:13px}
.seg button:last-child{border-right:0}
div.f.col{display:block}
.seg.wide{margin-top:3px}
.seg.wide button{flex:1;padding:6px 6px}
.seg button svg{width:19px;height:19px;display:block;fill:currentColor;pointer-events:none}
/* Barra degli strumenti (3.25.0): seconda riga sotto la testata, solo in Edit (fino alla 3.24.1 verticale a sinistra della tela). */
#wk{flex:1;display:flex;min-width:0;min-height:0}
#tools{flex:0 0 auto;display:flex;flex-direction:row;align-items:center;gap:2px;
  padding:2px 10px;border-bottom:1px solid var(--line);background:var(--chrome);overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
#tools.off{display:none}
#tools button{flex:0 0 auto;width:28px;height:32px;display:flex;align-items:center;justify-content:center;padding:0;
  background:none;border:0;border-radius:6px;cursor:pointer;color:var(--ink2)}
#tools button:hover{background:var(--chrome2);color:var(--ink)}
#tools button svg{width:20px;height:20px;display:block;fill:currentColor;pointer-events:none}
#tools button[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent)}
#tools .rsep{flex:0 0 auto;width:1px;height:18px;background:var(--line);margin:0 4px}
@media (pointer:coarse){#tools button{width:40px;height:44px}#tools button svg{width:22px;height:22px}}
#xf button{padding:5px 7px}
#xf button:disabled{opacity:.35;cursor:default}
#menu{padding:5px 7px}
#menu svg{width:19px;height:19px;display:block;fill:currentColor}
/* Barra in alto compatta; sui tocchi un po' più grande. */
header{gap:7px;padding:5px 12px}
header h1{font-size:13px}
header .btn,header .seg button{padding:3px 9px;font-size:12px;line-height:1.4}
header .seg button svg,header #menu svg{width:15px;height:15px}
header #menu{padding:4px 6px}
header .tg span{width:25px;height:23px;border-radius:5px}
header .tg svg{width:15px;height:15px}
header .num{padding:2px 5px;font-size:12px}
header #gs{width:50px!important}
header #snl{font-size:12px!important}
/* Linguette della vista (Edit, Preview, Test, Flows, Code) sul bordo della barra: la scelta ha la cornice,
   aperta in basso (copre il bordo della barra, -6px = padding 5 + bordo 1), e il filo d'accento in alto. */
#mtab{display:flex;gap:2px;align-self:stretch;align-items:flex-end;margin:-5px 0 -6px}
#mtab button{background:none;border:1px solid transparent;border-bottom:0;border-radius:6px 6px 0 0;padding:4px 10px 6px;cursor:pointer;font-size:12px;font-weight:600;color:var(--ink2)}
#mtab button:hover{color:var(--ink)}
#mtab button[aria-selected="true"]{color:var(--accent);border-color:var(--line);border-top:2px solid var(--accent);background:var(--chrome);box-shadow:0 1px 0 var(--chrome)}
@media (pointer:coarse){#mtab button{padding:8px 12px 8px;font-size:13px}}
/* Code a tutta area: via la tela e i comandi che agiscono su di lei. */
main.code{display:none}
header.code :is(#uc,#xf,.snap){display:none!important}
#sbot.code :is(#zf,#zc,#zl){display:none!important}
@media (pointer:coarse){header .btn,header .seg button{padding:5px 10px}header .tg span{width:30px;height:28px}header .tg svg{width:17px;height:17px}header .seg button svg{width:17px;height:17px}}
.seg button[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent);font-weight:500}
.btn{background:var(--chrome2);border:1px solid var(--line);border-radius:6px;padding:6px 11px;cursor:pointer;font-size:13px}
.btn:hover{border-color:var(--accent)}
.btn[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.btn.go{background:var(--accent);color:var(--text-primary-color,#fff);border-color:var(--accent)}
.num,select.num{background:var(--chrome2);border:1px solid var(--line);border-radius:5px;padding:5px 7px;width:76px;
  font-family:var(--mono);font-size:12px}
input[type=text].num,select.num{width:100%;font-family:inherit}
input[type=range].num{padding:0;width:120px}
label.f,div.f{display:flex;align-items:center;justify-content:flex-end;gap:8px;font-size:12.5px;color:var(--ink2);margin-bottom:7px}
label.f.col{display:block}
/* Righe in linea con il campo a tutta larghezza, allineate all'etichetta più lunga del gruppo. */
.fg{display:grid;grid-template-columns:max-content minmax(0,1fr);column-gap:8px;row-gap:7px;align-items:center;font-size:12.5px;color:var(--ink2);margin-bottom:7px}
.fg>label.f{display:contents}
label.f.col .num{margin-top:3px}
label.chk{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ink2);cursor:pointer}

main{flex:1;display:flex;min-height:0;min-width:0}
#work{flex:1;min-width:0;min-height:0;display:grid;grid-template-columns:20px minmax(0,1fr);grid-template-rows:20px minmax(0,1fr)}
#rcorner{background:var(--chrome2);border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink2)}
#rcorner svg{width:13px;height:13px;fill:currentColor;display:block}
#rcorner[aria-pressed="true"]{color:var(--guide)}
.ruler{position:relative;overflow:hidden;background:var(--chrome2);touch-action:none;user-select:none;-webkit-user-select:none}
.ruler canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block}
#rtop{border-bottom:1px solid var(--line);cursor:row-resize}
#rleft{border-right:1px solid var(--line);cursor:col-resize}
.ruler.off{cursor:default}
#stage{min-width:0;min-height:0;background:var(--paper);display:grid;place-content:safe center;padding:18px;overflow:auto;touch-action:none;overscroll-behavior:contain}
svg#cv{margin:auto;touch-action:none;box-shadow:0 0 0 1px var(--line);
  user-select:none;-webkit-user-select:none}
svg#cv image{-webkit-user-drag:none;user-select:none;pointer-events:none}
svg#cv text{user-select:none}
#out,input,textarea{user-select:text;-webkit-user-select:text}
aside{width:var(--aside-w,300px);flex:0 0 var(--aside-w,300px);max-width:calc(100% - 240px - var(--rail-w));min-height:0;display:flex;flex-direction:column;overflow:hidden;padding-left:4px}
#wgrip{flex:0 0 8px;cursor:ew-resize;touch-action:none;border-left:1px solid var(--line);display:flex;align-items:center;justify-content:center}
#wgrip::after{content:'';width:4px;height:40px;border-radius:2px;background:var(--line)}
#wgrip:hover::after,#wgrip.on::after{background:var(--accent)}
@media (pointer:coarse){#wgrip{flex-basis:16px}}
aside .ahead{padding:8px 14px 0 0;flex:0 0 auto;display:flex;align-items:center;gap:8px;min-height:30px}
/* Icone del riquadro su una seconda riga sotto le linguette, più piccole. */
aside .abar{flex:0 0 auto;display:flex;justify-content:flex-end;padding:2px 14px 3px 0;min-height:22px}
aside .ahead h2{margin:0;flex:1}
/* Linguette del riquadro (Objects, Rules, Styles, Animations) e del pannello della selezione (Settings, Look,
   Behavior), come quelle della vista: la scelta ha la cornice aperta in basso, che copre il filo sotto,
   e il filo d'accento in alto. */
#ltab{display:flex;gap:2px;flex:1;min-width:0;align-self:stretch;align-items:flex-end;border-bottom:1px solid var(--line)}
#insp .itabs{display:flex;align-items:flex-end;gap:2px;margin:-4px 0 10px;border-bottom:1px solid var(--line);position:sticky;top:-6px;z-index:2;background:var(--chrome);padding-top:4px}
#insp .itabs:first-child{margin-top:0}
#ltab button,#insp .itabs button{background:none;border:1px solid transparent;border-bottom:0;border-radius:6px 6px 0 0;margin-bottom:-1px;padding:4px 8px 6px;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--ink2)}
#ltab button:hover,#insp .itabs button:hover{color:var(--ink)}
#ltab button[aria-selected="true"],#insp .itabs button[aria-selected="true"]{color:var(--accent);border-color:var(--line);border-top:2px solid var(--accent);background:var(--chrome)}
@media (pointer:coarse){#ltab button,#insp .itabs button{padding:8px 10px 8px;font-size:13px}}
#insp .ipane{display:none}
#insp[data-itab="set"] .ipane[data-pane="set"],#insp[data-itab="look"] .ipane[data-pane="look"],#insp[data-itab="bh"] .ipane[data-pane="bh"]{display:block}
#insp .evb{background:none;border:1px solid var(--line);border-radius:4px;width:24px;height:24px;padding:0;cursor:pointer;color:var(--ink2);flex:0 0 auto}
#insp .evb:disabled{opacity:.35;cursor:default}
@media (pointer:coarse){#insp .evb{width:32px;height:32px}}
#insp .slr.sty{min-height:28px}
#insp .slr.sty .nm{color:var(--ink);flex:1;min-width:0}
#insp .slr.sty i{color:var(--ink2);font-style:normal;font-size:11.5px}
/* Il menu degli stili ha l'aspetto di un pulsante «+ style» (resta un select: sul tablet si
   apre l'elenco del sistema). */
select.num.stadd{-webkit-appearance:none;appearance:none;width:auto;display:block;padding:4px 11px;border-radius:6px;cursor:pointer;
  font-family:inherit;font-size:12.5px;color:var(--ink);background:var(--chrome2);border:1px solid var(--line);text-align:center}
select.num.stadd:hover{border-color:var(--accent)}
/* Tutti i «+ …» della fascia (menu e pulsanti) sono uguali: a tutta larghezza, tratteggiati, testo
   grigio al centro. */
select.num.stadd,.btn.add{width:100%;display:block;min-height:30px;padding:5px 11px;border:1px dashed var(--line);border-radius:6px;
  background:transparent;color:var(--ink2);font-family:inherit;font-size:12.5px;text-align:center;text-align-last:center;cursor:pointer}
select.num.stadd:hover,.btn.add:hover{border-color:var(--accent);color:var(--ink)}
@media (pointer:coarse){select.num.stadd,.btn.add{min-height:36px}}
#insp .lkadd{margin:4px 0 6px}
/* Linguetta Look: predefinito e caselle degli stili, ognuno con Edit. */
#insp .slr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 0;min-height:30px}
#insp .slr .nm{font-size:12.5px;color:var(--ink2)}
#insp .slr .chk{margin:0;flex:1;min-width:0}
#insp .slr .btn{padding:3px 9px}
/* Elenco delle foto della zona nella linguetta Look. */
#insp .phr{gap:4px;min-height:34px;border-radius:6px;padding:2px 4px;margin:0 -4px}
#insp .phb.on{background:var(--accent-soft);border-radius:6px;padding:0 4px 2px;margin:0 -4px 4px}
#insp .phb.on .phr{margin:0;padding:2px 0}
#insp .phr .car{flex:0 0 auto;width:14px;text-align:center;color:var(--ink2)}
#insp .phr .phl{display:flex;flex-direction:column;min-width:0}
#insp .phr .phn{flex:1;min-width:0;display:flex;align-items:center;gap:4px;background:none;border:0;padding:2px 0;cursor:pointer;color:var(--ink);text-align:left;font:inherit}
#insp .phr .phn b{font-weight:500;font-size:12.5px}
#insp .phr .phn small{color:var(--ink2);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
#insp .phr .evb:disabled{opacity:.35;cursor:default}
/* Sfondi in più nel pannello Background. */
#blpanel .bll{border:1px solid var(--line);border-radius:8px;padding:8px 9px 6px;margin:0 0 8px;break-inside:avoid}
#blpanel .blh{display:flex;align-items:center;gap:4px;margin-bottom:4px}
#blpanel .blh .num{flex:1;min-width:0;width:auto;font-family:inherit;font-weight:500}
#blpanel .evb{background:none;border:1px solid var(--line);border-radius:4px;width:24px;height:24px;padding:0;cursor:pointer;color:var(--ink2);flex:0 0 auto}
#blpanel .evb:disabled{opacity:.35;cursor:default}
#blpanel .slr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 0;min-height:28px}
#blpanel .slr .nm{font-size:12.5px;color:var(--ink);flex:1;min-width:0}
#blpanel .blr{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:4px 0}
#blpanel .blr .btn{padding:2px 8px;font-size:12px}
@media (pointer:coarse){#blpanel .evb{width:32px;height:32px}}
/* Sezioni degli stili parziali: la casella sta nel titolo. */
h3 .chk.sec{display:inline-flex;margin:0;font:inherit;color:inherit;gap:6px}
/* Comandi della selezione accanto a «Items»: avanti, indietro, duplica, elimina. */
#ibar,#sbar,#tbar{display:flex;gap:1px}
#sbar[hidden],#ibar[hidden],#tbar[hidden]{display:none}
#ibar button,#sbar button,#tbar button{width:24px;height:22px;display:flex;align-items:center;justify-content:center;padding:0;background:none;border:0;border-radius:4px;cursor:pointer;color:var(--ink2)}
#ibar button:hover:not(:disabled),#sbar button:hover:not(:disabled),#tbar button:hover:not(:disabled){background:var(--chrome2);color:var(--ink)}
#ibar button:disabled,#sbar button:disabled,#tbar button:disabled{opacity:.3;cursor:default}
#ibar button[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent)}
#ibar svg,#sbar svg{width:15px;height:15px;fill:currentColor;display:block;pointer-events:none}
@media (pointer:coarse){#ibar button,#sbar button{width:34px;height:30px}#ibar svg,#sbar svg{width:18px;height:18px}}
#grip{flex:0 0 auto;height:14px;margin:0 14px 0 0;cursor:ns-resize;touch-action:none;display:flex;align-items:center;justify-content:center}
#grip::after{content:'';width:40px;height:4px;border-radius:2px;background:var(--line)}
#grip:hover::after,#grip.on::after{background:var(--accent)}
#detail{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 14px 14px 0;border-top:1px solid var(--line)}
#detail h2{margin-top:8px}
#fdock #detail h2{margin-top:2px}
aside h2,#fdock h2{font-size:12px;font-weight:600;color:var(--ink2);margin:0 0 9px}
/* Un solo stile per i titoli delle sezioni della fascia e del riquadro del Flusso, quello di Rules:
   piccolo, maiuscolo, spaziato. I titoli che sono nomi (.ttl) restano come sono scritti. */
aside h2,#fdock h2,aside h3,#fdock h3{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
aside h3,#fdock h3{margin:12px 0 6px}
aside h2.ttl,#fdock h2.ttl{font-size:12.5px;letter-spacing:0;text-transform:none;color:var(--ink)}
aside .ahead h2{text-transform:none;letter-spacing:0}
aside section,#fdock section{padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--line)}
aside section:last-child,#fdock section:last-child{border:0}
.row{display:flex;gap:7px;flex-wrap:wrap}
.hint{font-size:12px;color:var(--ink2);line-height:1.5;margin:6px 0 0}
.hint:empty{display:none}
.sub{margin-top:12px;padding-top:11px;border-top:1px dashed var(--line)}
/* Titolo di sezione come linguetta del riquadro che ne contiene righe e comandi (Look, regole, cause, layer). */
.tbx{margin:20px 0 8px}
#insp .tbx>h3,#rupanel .tbx>h3,#fdock .tbx>h3,#blpanel .tbx>h3{display:inline-block;position:relative;z-index:1;margin:0 0 -1px;padding:3px 10px 2px;line-height:1.3;border:1px solid var(--line);border-bottom:0;border-radius:6px 6px 0 0;background:var(--chrome)}
.tbx>.tbb{border:1px solid var(--line);border-radius:0 8px 8px 8px;padding:8px 8px 6px}
.tbx>.tbb>:first-child{margin-top:0}
.tbx>.tbb>:last-child{margin-bottom:0}
/* Menu del progetto: si apre dal titolo. */
header h1 #pmb{background:none;border:0;padding:2px 4px;margin:-2px -4px;border-radius:5px;font:inherit;color:inherit;cursor:pointer}
header h1 #pmb::after{content:" ▾";font-size:10px;color:var(--ink2)}
header h1 #pmb:hover,header h1 #pmb[aria-expanded="true"]{background:var(--chrome2)}
header #ptl{background:none;border:0;padding:0;font-family:var(--mono);font-size:12px;color:var(--ink2);cursor:pointer;display:flex;align-items:center;gap:4px;max-width:180px}
header #ptl #pname{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
header #pdot{font-size:13px;line-height:1;color:var(--accent)}
header #pdot[hidden]{display:none}
header #pgb[hidden]{display:none}
header #pgb{background:none;border:0;padding:2px 4px;border-radius:5px;font-family:var(--mono);font-size:12px;color:var(--ink);cursor:pointer;display:flex;align-items:center;gap:4px;max-width:150px;white-space:nowrap}
header #pgb::after{content:" ▾";font-size:10px;color:var(--ink2)}
header #pgb:hover,header #pgb[aria-expanded="true"]{background:var(--chrome2)}
header #pgn{overflow:hidden;text-overflow:ellipsis}
#pgmenu{position:fixed;z-index:20;background:var(--chrome);color:var(--ink);border:1px solid var(--line);border-radius:8px;box-shadow:0 8px 24px rgba(10,20,35,.22);padding:4px;width:220px;max-height:70vh;overflow-y:auto;display:flex;flex-direction:column}
#pgmenu[hidden]{display:none}
#pgmenu>button{display:flex;justify-content:space-between;align-items:center;gap:8px;background:none;border:0;border-radius:5px;padding:6px 9px;font:inherit;font-size:12.5px;color:var(--ink);text-align:left;cursor:pointer}
#pgmenu>button:hover:not(:disabled){background:var(--chrome2)}
#pgmenu>button:disabled{opacity:.4;cursor:default}
#pgmenu>button[aria-checked="true"]{font-weight:600;color:var(--accent)}
#pgmenu hr{border:0;border-top:1px solid var(--line);margin:4px 2px}
@media (pointer:coarse){#pgmenu>button{padding:10px 11px}}
.pgsec{margin:6px 6px 2px;font-size:11px;color:var(--ink2)}
#pmenu{position:fixed;z-index:20;background:var(--chrome);color:var(--ink);border:1px solid var(--line);border-radius:8px;box-shadow:0 8px 24px rgba(10,20,35,.22);padding:4px;width:250px;max-height:70vh;overflow-y:auto}
#pmenu[hidden]{display:none}
#pmenu .pmv{display:flex;flex-direction:column}
#pmenu .pmv[hidden]{display:none}
#pmenu .pmv>button{display:flex;justify-content:space-between;align-items:center;gap:8px;background:none;border:0;border-radius:5px;padding:6px 9px;font:inherit;font-size:12.5px;color:var(--ink);text-align:left;cursor:pointer}
#pmenu .pmv>button:hover:not(:disabled){background:var(--chrome2)}
#pmenu .pmv>button:disabled{opacity:.4;cursor:default}
#pmenu kbd{font-family:var(--mono);font-size:11px;color:var(--ink2)}
#pmenu hr{border:0;border-top:1px solid var(--line);margin:4px 2px}
#pmenu .pmback{font-weight:600}
#pmenu #pmsg{margin:4px 9px}
#pmenu #pmsg:empty{display:none}
@media (pointer:coarse){#pmenu .pmv>button{padding:10px 11px}}
#pmenu .pmv>[hidden]{display:none}
#plist{max-height:50vh;overflow-y:auto;padding:2px}
#plist .pr{display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:5px;cursor:pointer}
#plist .pr:hover{background:var(--chrome)}
#plist .pr.on{background:var(--accent-soft);color:var(--accent)}
#plist .pr img{width:44px;height:30px;object-fit:cover;border-radius:3px;background:var(--chrome);flex:0 0 auto}
#plist .pr .nm{font-family:var(--mono);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#plist .pr .sb{font-size:11px;color:var(--ink2)}
/* Progetto della 1.x: non si apre, si può solo eliminare. */
#plist .pr.v1{cursor:default;opacity:.75}
#plist .pr.v1 .btn{flex:0 0 auto;padding:3px 9px}
#pname{font-family:var(--mono);font-size:13px;word-break:break-all}
/* Versione in fondo al pannello Project (3.24.1; prima in fondo all'elenco dei progetti); in arancione se il server ne ha un'altra. */
#projpanel label.f{white-space:nowrap}
/* Campi del pannello Project (3.24.1): due caratteri più larghi, allineati a destra, la scelta di aspect ratio
   larga e scritta come i campi numerici. */
#projpanel label.f .num{width:92px;flex:0 0 auto;text-align:right;text-align-last:right;font-family:var(--mono);font-size:12px}
#projpanel hr.psep{border:0;border-top:1px solid var(--line);margin:10px 0}
#pver{margin:10px 0 2px;font-family:var(--mono);font-size:11px;text-align:right}
#pver.diff{color:var(--warning-color,#b06f0c)}
/* Pannello degli stili. */
/* Righe degli stili nell'elenco, linguetta Styles. */
#list div.sr{display:flex;align-items:center;gap:8px;padding:5px 6px}
#list .sr svg{width:30px;height:20px;flex:0 0 auto;display:block}
#list .sr .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#list .sr .sb{font-size:11px;color:var(--ink2);flex:0 0 auto}
.slr[data-so]{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#list .sr[data-sr]{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
#list .sr.un .nm{color:var(--ink2)}
#list .grh.sot{box-shadow:inset 0 0 0 2px var(--accent)}
.slr.sod{opacity:.45;box-shadow:inset 0 0 0 1.5px var(--accent)}
.slr.sot{box-shadow:inset 0 2px 0 var(--accent)}
.slr.sot.dn{box-shadow:inset 0 -2px 0 var(--accent)}
.slr .sow{color:var(--warning-color,#e8a33d);cursor:help}
#list div.sr.on .sb{color:inherit}
/* Righe dell'elenco Causes · Rules: fulmine (d'accento se vero adesso, rosso se simulato),
   nome, sotto il dettaglio. */
#list div.er{display:flex;align-items:center;gap:6px;padding:5px 6px}
#list .er .eb{display:flex;flex:0 0 auto;color:var(--ink2)}
#list .er .eb svg{width:13px;height:13px;fill:currentColor}
#list .er .eb.t{color:var(--accent)}
#list .er .eb.f{color:var(--error-color,#d32f2f)}
#list .er .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#list .er .sb{font-size:11px;color:var(--ink2);flex:0 0 auto}
#list .er .eb.n{visibility:hidden}
#list .er.ri .nm{flex:1 1 auto;min-width:min(8em,45%)}
#list .er.ri .sb{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rig{display:inline-flex;flex:none;vertical-align:-1px;margin-left:4px}
#list div.er.ri{padding-left:24px}
#list div.er.on .sb,#list div.er.on .eb:not(.f){color:inherit}
/* By cause · By object in cima all'elenco di Rules; testate con ▸ ▾ (cause, oggetti, gruppi). */
#list .rusw{display:flex;gap:2px;margin:2px 4px 4px}
#list .rusw button{background:none;border:0;border-radius:4px;padding:2px 7px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);cursor:pointer}
#list .rusw button[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent)}
#list div.er.rh{cursor:pointer}
#list div.er.rh .fold{margin-right:-2px}
#list div.er.nc .nm{color:var(--ink2)}
#list div.er.dr{border:1px dashed var(--warning-color,#d08a1c);border-radius:6px;margin:2px 0}
#list div.er.dr .nm{font-style:italic}
/* Linguetta Rules: intestazioni delle due sezioni dell'elenco, editor della regola e
   della causa, linguetta Behavior della selezione. */
#list p.lh{margin:4px 6px 2px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2)}
#rbar{display:flex;gap:1px}
#rbar[hidden]{display:none}
#rbar button{width:24px;height:22px;display:flex;align-items:center;justify-content:center;padding:0;background:none;border:0;border-radius:4px;cursor:pointer;color:var(--ink2)}
#rbar button:hover:not(:disabled){background:var(--chrome2);color:var(--ink)}
#rbar button:disabled{opacity:.3;cursor:default}
#rbar svg{width:15px;height:15px;fill:currentColor;display:block;pointer-events:none}
@media (pointer:coarse){#rbar button{width:34px;height:30px}#rbar svg{width:18px;height:18px}}
#rupanel h3{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin:12px 0 6px}
#rupanel .rck{border:1px solid var(--line);border-radius:6px;padding:6px 8px 2px;margin:0 0 6px}
#rupanel .rck.on{border-color:var(--accent)}
#rupanel .rck.frc{border-color:var(--error-color,#d32f2f)}
/* Parti della regola da scegliere (causa, stile, bersaglio) tratteggiate nel colore d'avviso;
   la causa completa è una riga chiusa. */
#rupanel .rck.miss{border-style:dashed;border-color:var(--warning-color,#d08a1c)}
#rupanel select.num.stadd.miss,#rupanel .btn.add.miss,#blpanel .btn.miss{border-style:dashed;border-color:var(--warning-color,#d08a1c);color:var(--warning-color,#b06f0c)}
#rupanel .rck.rcc{padding:3px 6px 1px}
#rupanel .rck.rcc .rch{margin:0}
#rupanel .rck.rcc .rcn small{display:inline;margin-left:4px;overflow:hidden;text-overflow:ellipsis}
#rupanel .rch{display:flex;align-items:center;gap:6px;margin:0 0 4px}
#rupanel .rch.tg{border:1px solid var(--line);border-radius:6px;padding:4px 6px;margin:0 0 5px}
#rupanel .rcn{flex:1;min-width:0;background:none;border:0;padding:0;text-align:left;cursor:pointer;font-size:12.5px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#rupanel .rcn small{display:block;font-weight:400;font-size:11px;color:var(--ink2)}
#rupanel .rck.rcc .rcn{display:flex;align-items:baseline;gap:4px}
#rupanel .evb{background:none;border:1px solid var(--line);border-radius:4px;width:24px;height:24px;padding:0;cursor:pointer;color:var(--ink2);flex:0 0 auto}
#rupanel .evn{font-size:11.5px;color:var(--ink2);margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#rupanel .rck.on .evn{color:var(--accent)}
#rupanel .evq{display:flex;gap:4px;align-items:center;margin-top:4px}
#rupanel .evq select{flex:0 0 auto;width:auto;min-width:0}
#rupanel .evq select[data-cf="a"]{flex:1 1 0;max-width:40%}
#rupanel .evq input{flex:1 1 0;min-width:0}
#rupanel .evq span{font-size:11.5px;color:var(--ink2)}
/* Titolo della causa che diventa la casella del nome (doppio clic). */
#rupanel .rch input.rcti{flex:1 1 0;min-width:0;font-size:12.5px;font-weight:600;padding:2px 6px}
#rupanel .evb:disabled{opacity:.35;cursor:default}
/* Linguetta «output» della causa: sotto il riquadro, a destra, attaccata al suo bordo. */
#rupanel .rcw{display:flex;flex-direction:column;margin:0 0 6px}
#rupanel .rcw>.rck{margin:0}
#rupanel .rco{align-self:flex-end;position:relative;z-index:1;display:flex;align-items:baseline;gap:6px;max-width:75%;margin:-1px 10px 0 0;padding:1px 8px 2px;
  border:1px solid var(--line);border-top:0;border-radius:0 0 6px 6px;background:var(--chrome);font-size:12px;line-height:1.35}
#rupanel .rco span{flex:0 0 auto;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
#rupanel .rco b{min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#rupanel .rck.on+.rco{border-color:var(--accent)}
#rupanel .rck.on+.rco b{color:var(--accent)}
#rupanel .rck.frc+.rco{border-color:var(--error-color,#d32f2f)}
#rupanel .rck.frc+.rco b{color:var(--error-color,#d32f2f)}
#rupanel .rck.miss+.rco{border-style:dashed;border-color:var(--warning-color,#d08a1c)}
/* Linguetta «output» del When nella regola: sotto il riquadro della sezione, a destra. */
#rupanel .rof{display:flex;justify-content:flex-end}
#rupanel .rof>.rco.on{border-color:var(--accent)}
#rupanel .rof>.rco.on b{color:var(--accent)}
#rupanel .rof>.rco.frc{border-color:var(--error-color,#d32f2f)}
#rupanel .rof>.rco.frc b{color:var(--error-color,#d32f2f)}
#rupanel .rof>.rco.miss{border-style:dashed;border-color:var(--warning-color,#d08a1c)}
/* Cancel e Create di una regola o di una causa nuove. */
#rupanel .rdr{justify-content:flex-end;margin-top:10px}
#rupanel .rdr .btn:disabled{opacity:.4;cursor:default}
/* Linguetta Test: un riquadro per entità delle cause, con i campi simulabili e le sue cause. */
#list div.te{display:flex;align-items:baseline;gap:6px;padding:4px 6px}
#list .te .nm{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#list .te .nm.no{color:var(--error-color,#d32f2f)}
#list .te .tv{flex:0 1 auto;min-width:0;max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;color:var(--ink2)}
#list .te .tv.sim{color:var(--error-color,#d32f2f)}
#list .te .tu{flex:0 0 auto;font-size:11.5px;color:var(--ink2)}
#list .te .tu small{font-size:10px}
#list div.te.on .tv:not(.sim),#list div.te.on .tu{color:inherit}
/* Riquadro della linguetta Test: i campi dell'entità scelta, le sue cause, gli oggetti toccati. */
#tepanel h3{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin:12px 0 6px}
#tepanel .teid{margin:-6px 0 8px}
#tepanel .tef{display:flex;gap:4px;align-items:center;margin-bottom:4px}
#tepanel .tef>span{flex:0 0 72px;font-size:12px;color:var(--ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tepanel .tef input{flex:1 1 0;min-width:0}
#tepanel .tef input.sim{color:var(--error-color,#d32f2f);border-color:var(--error-color,#d32f2f)}
#tepanel .tef .evb[hidden]{display:none}
#tepanel .evu{display:flex;flex-direction:column;gap:1px}
#tepanel .evu button{display:flex;align-items:center;gap:5px;background:none;border:0;border-radius:4px;padding:3px 6px;text-align:left;font-size:12.5px;color:var(--ink);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tepanel .evu button:hover{background:var(--chrome2)}
#tepanel .evu button.on{color:var(--accent)}
#tepanel .evu svg{width:12px;height:12px;flex:0 0 auto;fill:currentColor;color:var(--ink2)}
#tepanel .evu button.on svg{color:var(--accent)}
#rupanel .lkadd{margin:2px 0 8px}
/* Riquadro Then del tocco (3.19.0): riga fra le azioni, «+ action» piccolo a sinistra; un menu che manca
   (la Motion di Apply motion e di drive) tratteggiato nel colore d'avviso. */
#rupanel hr.rsep{border:0;border-top:1px solid var(--line);margin:8px 0}
#rupanel select.num.stadd.a2{width:auto;display:inline-block;min-height:26px;padding:2px 10px;font-size:12px;text-align:left;text-align-last:left}
#rupanel select.num.miss:not(.stadd){border-style:dashed;border-color:var(--warning-color,#d08a1c)}
#rupanel .rlb{margin:0 0 4px;font-size:12.5px;font-weight:600}
/* Proprietà legata al valore: righe valore → proprietà e punto fisso fra nove. */
#rupanel .evq.bnd input.num{flex:1 1 0;min-width:0;width:auto}
#rupanel .evq.bnd .clr{flex:1 1 0;display:flex;gap:4px;align-items:center;min-width:0}
#rupanel .evq.bnd .clr input[type=range]{flex:1 1 0;min-width:0;width:auto}
#rupanel .pvg,#stpanel .pvg{display:grid;grid-template-columns:repeat(3,16px);gap:3px}
#rupanel .pvg button,#stpanel .pvg button{width:16px;height:16px;padding:0;border:1px solid var(--line);border-radius:3px;background:var(--chrome2);cursor:pointer}
#rupanel .pvg button[aria-pressed="true"],#stpanel .pvg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent)}
#rupanel textarea.num{width:100%;box-sizing:border-box;resize:vertical;min-height:50px;font-family:ui-monospace,Menlo,monospace;font-size:12px}
#insp textarea.cdy{width:100%;box-sizing:border-box;resize:vertical;min-height:120px;margin:0 0 8px;font-family:ui-monospace,Menlo,monospace;font-size:12px}
#insp .btn.cdv{display:block;width:100%;margin:6px 0 8px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#rupanel .slr{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:2px 0;min-height:28px}
#rupanel .slr .nm{flex:1;min-width:0;font-size:12.5px}
#rupanel .slr .btn{padding:3px 9px}
#rupanel .evu{display:flex;flex-direction:column;gap:2px;margin-top:4px}
#rupanel .evu button{background:none;border:0;border-radius:4px;padding:4px 6px;text-align:left;font-size:12.5px;color:var(--ink);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#rupanel .evu button:hover{background:var(--chrome2)}
@media (pointer:coarse){#rupanel .evb{width:32px;height:32px}}
#insp .bhl{display:flex;flex-direction:column;gap:4px}
#insp .bhr{display:block;text-align:left;background:none;border:1px solid var(--line);border-radius:6px;padding:5px 8px;cursor:pointer;color:var(--ink);font-size:12.5px}
#insp .bhr small{display:block;font-size:11px;color:var(--ink2)}
#insp .bhr.on{border-color:var(--accent)}
#insp .bhr.f{border-color:var(--error-color,#d32f2f)}
#insp .bhr:hover{background:var(--chrome2)}
#insp .bhe{display:flex;flex-direction:column;gap:4px;margin-bottom:8px}
#stsw{display:block;width:100%;height:auto;margin:8px 0 10px;border:1px solid var(--line);border-radius:6px}
#stpanel h3{margin:12px 0 7px}
#stpanel .mrow{display:flex;gap:8px;margin-bottom:9px}
#stpanel .mrow label.f.col{flex:1;min-width:0;margin:0}
#stpanel .mrow .num{width:100%;box-sizing:border-box}
#stpanel .mu{position:relative;display:block;margin-top:3px}
#stpanel .mu .num{margin-top:0;padding-right:18px}
#stpanel .mu i{position:absolute;right:7px;top:50%;transform:translateY(-50%);font-style:normal;font-size:12px;color:var(--ink2);pointer-events:none}
#stpanel .mrow2{display:flex;gap:14px;align-items:flex-end;margin-bottom:4px}
#stpanel .mrow2>div.f.col{margin:0}
#stpanel .mrow2 .pvg{margin-top:4px}
#stpanel .mrow2 .mez{flex:1;min-width:0}
#stpanel .mrow2 .mez label.f.col{margin-bottom:6px}
#stpanel h3.msec{margin:14px 0 8px;padding-bottom:5px;border-bottom:1px solid var(--line)}
#stpanel .ptabs{display:flex;flex-wrap:wrap;align-items:flex-end;gap:2px;border-bottom:1px solid var(--line);padding-left:2px}
#stpanel .ptabs .pt,#stpanel .ptabs input.pte{width:48px;box-sizing:border-box;margin-bottom:-1px;border:1px solid var(--line);border-bottom:0;border-radius:6px 6px 0 0;padding:4px 0 5px;font:600 12.5px var(--ha-font-family-body,inherit);text-align:center}
#stpanel .ptabs .pt{background:var(--chrome2);cursor:pointer;color:var(--ink2)}
#stpanel .ptabs .pt[aria-selected="true"],#stpanel .ptabs input.pte{color:var(--accent);border-top:2px solid var(--accent);background:var(--chrome);position:relative;z-index:1}
#stpanel .ptabs input.pte{padding:4px 2px 5px;-moz-appearance:textfield}
#stpanel .ptabs input.pte::-webkit-inner-spin-button{display:none}
#stpanel .ptabs .pbr{flex-basis:100%;height:0}
#stpanel .ptabs .pm{margin-left:auto;display:flex;gap:3px;padding-bottom:3px}
#stpanel .ptabs .pm .evb{font-size:15px;line-height:1}
#stpanel .ptabs .pm .evb:disabled{opacity:.4;cursor:default}
#stpanel .pbox{border:1px solid var(--line);border-top:0;border-radius:0 0 6px 6px;padding:10px 8px 1px;margin-bottom:9px}
#stpanel .prw{display:flex;align-items:center;gap:5px;margin-bottom:7px;font-size:12.5px;color:var(--ink2)}
#stpanel .prw select.num{flex:1;width:auto;min-width:0}
#stpanel .prw .pax{flex:0 0 auto;width:62px}
#stpanel .prw input[type=number].num{width:66px;flex:0 0 auto}
#stpanel .prw .pu{width:16px;flex:0 0 auto}
#stpanel .prw .clr{gap:4px}
#stpanel .prw .clr input[type=color]{width:34px;height:26px}
#stpanel .prw .clr input[type=range]{width:52px}
#stpanel .pbox>label.f.col{margin-bottom:7px}
@media (pointer:coarse){#stpanel .ptabs .pt,#stpanel .ptabs input.pte{width:54px;padding:8px 0}}
.clr{display:flex;align-items:center;gap:8px}
.clr input[type=color]{width:44px;padding:2px;height:28px}
.clr input[type=range]{width:96px}
#list{position:relative;flex:0 0 auto;height:180px;min-height:0;overflow-y:auto;margin:0 14px 0 0;border:1px solid var(--line);border-radius:6px;padding:4px;background:var(--chrome2);touch-action:pan-y}
#list div.pin + div:not(.pin){margin-top:3px;border-top:1px dashed var(--line);border-radius:0 0 5px 5px;padding-top:6px}
#list div{padding:4px 8px;border-radius:5px;cursor:pointer;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
#list div:hover{background:var(--chrome2)}
#list div.on{background:var(--accent-soft);color:var(--accent)}
#list div.held{box-shadow:inset 0 0 0 1.5px var(--accent);cursor:grabbing}
#list.dragging div[data-i]{cursor:grabbing}
#list div.lift{opacity:.45}
#list .ins{position:absolute;left:4px;right:4px;height:2px;margin-top:-1px;border-radius:1px;background:var(--accent);pointer-events:none;display:none}
/* Gruppi: testata con triangolo per chiudere e aprire, membri rientrati sotto. */
#list div.grh{font-weight:600}
#list div.grh.part{color:var(--accent)}
#list div.in{padding-left:28px}
#list .fold{display:inline-block;width:20px;margin:-4px 2px -4px -6px;padding:4px 0;text-align:center;color:var(--ink2);cursor:pointer}
#list .lkb{float:right;display:flex;align-items:center;justify-content:center;width:18px;height:18px;margin:-1px -4px 0 4px;
  color:var(--ink2);opacity:0;cursor:pointer;border-radius:4px}
#list .lkb svg{width:13px;height:13px;fill:currentColor}
#list div:hover>.lkb{opacity:.6}
#list .lkb:hover{opacity:1;color:var(--ink)}
/* Bloccata dal gruppo = accesa come il lucchetto del gruppo (prima grigia a metà). */
#list .lkb.inh{opacity:1;color:var(--accent)}
#list .lkb.on{opacity:1;color:var(--accent)}
#list .lkb.on:hover{color:var(--accent)}
@media (pointer:coarse){#list .lkb{width:28px;height:24px;margin:-4px -6px -4px 4px;opacity:.3}#list .lkb.inh{opacity:1;color:var(--accent)}#list .lkb.on{opacity:1;color:var(--accent)}}
/* Voce nascosta in modifica (occhio chiuso): nome attenuato. */
#list div.vh:not(.on){color:var(--ink2)}
/* Segno delle regole (evBadge): fulmine accanto al lucchetto per le voci e i gruppi bersaglio di regole,
   rosso se una ha una causa forzata. I gruppi lo prendono anche dal contenuto. */
#list .evbd{float:right;display:flex;align-items:center;justify-content:center;width:14px;height:18px;margin:-1px 0 0 4px;color:var(--ink2);pointer-events:none}
#list .evbd svg{width:12px;height:12px;fill:currentColor}
#list .evbd.f{color:var(--error-color,#d32f2f)}
#list div.on>.evbd:not(.f){color:inherit}
#list .gc{font-weight:400;color:var(--ink2);font-size:11.5px;margin-left:5px}
@media (pointer:coarse){#list .fold{width:28px;padding:8px 0;margin:-8px 2px -8px -8px}}
.gbx{fill:none;stroke:var(--accent);stroke-width:1;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}
.gbx.in,.gbx.hov{opacity:.45}
.gbx.on{stroke-width:1.5}

.z{fill:var(--zone);stroke:var(--zone-line);stroke-width:1;cursor:pointer}
.z:not(.gm):hover{fill:var(--accent-soft)}
.z.sel{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2}
.el{cursor:pointer}
.el:not(.gm):hover .hit,.el.sel .hit{fill:var(--accent-soft);stroke:var(--accent);stroke-width:1}
#cv.pv .el .hit{display:none}
.z,.gd,.hd,.guide{vector-effect:non-scaling-stroke}
#cv.pv .z{fill:transparent !important;stroke:none !important}
/* Card di Home Assistant: strato sopra le forme; non prende il puntatore, che va alla sagoma sotto
   (scelta e trascinamento; in Test la scelta). */
#cards{pointer-events:none}
/* La card sta in div.cds dentro div.cdb, con gli stili e le regole; può uscire dal suo riquadro (spostata,
   ruotata, con l'alone). */
#cards foreignObject{overflow:visible}
#cards .cdb{display:block;position:relative;width:100%;height:100%}
#cards .cds{display:block;position:relative;width:100%;height:100%;clip-path:inset(0)}
#cards .cdx{font:12px var(--ha-font-family-code,ui-monospace,Menlo,monospace);color:var(--ink2);padding:6px}
#cv .pga{pointer-events:none}
#cv .pga .pgo,#cv .pga .pgi{fill:none;vector-effect:non-scaling-stroke;stroke-dasharray:8 5}
#cv .pga .pgo{stroke:var(--chrome);stroke-opacity:.8;stroke-width:5px}
#cv .pga .pgi{stroke:var(--ink);stroke-width:2px}
#cv .pga .pgt{fill:var(--ink)}
#cv .pga text{fill:var(--chrome);font-family:var(--ha-font-family-body,system-ui,sans-serif);font-weight:500}
#cv:not(.pv) .cm{opacity:.8}
#cv:not(.pv) .cm>.z{stroke-dasharray:6 4}
#cv:not(.pv) .el.cm .hit{stroke:var(--zone-line);stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
/* Zona con il suo stile disegnato sotto: la sagoma dell'editor resta sopra,
   trasparente, riceve il puntatore e mostra solo passaggio e selezione. */
.z.hs{fill:transparent;stroke:none}
.z.hs:not(.gm):not(.sel):hover{fill:var(--accent-soft)}
.z.hs.sel{fill:transparent;stroke:var(--accent);stroke-width:2}
.zl{pointer-events:none}
/* Linee: la sagoma è la sola curva; il flusso scorre sulla tela con --lnp (passo, negativo). */
.z.ln{fill:none}
.z.ln.hs:not(.gm):not(.sel):hover{stroke:var(--accent);stroke-opacity:.45;stroke-width:3}
@keyframes ed-lnf{to{stroke-dashoffset:var(--lnp)}}
/* Voci bloccate: in modifica la tela non le prende, il clic passa a ciò che sta sotto.
   Membri di un gruppo preso come unità (.gm): niente evidenza propria al passaggio del mouse. */
#cv:not(.pv) .lk{pointer-events:none}
#cv.pv .thru{pointer-events:none}
.lbl.lk{opacity:.45}
#cv .z.sel,#cv .el.sel,#cv .gs{cursor:move}
#cv.hand,#cv.space{cursor:grab}
#cv.panning,#cv.panning *{cursor:grabbing}
#cv.hand .z,#cv.hand .el,#cv.hand .hh,#cv.space .z,#cv.space .el,#cv.space .hh{cursor:inherit}
#cv.pv .lbl{display:none}
.lbl{font:500 12px var(--mono);fill:var(--ink2);text-anchor:middle;pointer-events:none}
.hd{fill:var(--paper);stroke:var(--accent);stroke-width:1.5;pointer-events:none}
.hd.tp{fill:var(--accent)}
.hd.bd{fill:none;stroke-width:2}
.hd.hm{fill:none;stroke-width:1.5}
.hd.hmb{fill:var(--paper);stroke:none}
.vsb{align-items:center;margin-bottom:7px}
.vsb .seg button{padding:4px 9px;min-width:30px}
.vsb .seg button:disabled{opacity:.4;cursor:default}
.vsn{flex:1;font-size:12.5px;color:var(--ink2);text-align:center}
.hh[data-vm]{cursor:copy}
.hh{fill:transparent;stroke:none;cursor:grab}
.gd{fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:4 3;pointer-events:none}
.guide{fill:none;stroke:var(--accent);stroke-width:1;stroke-dasharray:5 4;pointer-events:none}
.guidep{fill:var(--accent);pointer-events:none}
.gl{fill:none;stroke:var(--guide);stroke-width:1;vector-effect:non-scaling-stroke;pointer-events:none}
/* Sulla tela le guide sono trasparenti al puntatore: si prendono solo dal segnalino sul righello. */
#gdl{pointer-events:none}
.gsel .gl,.ghot .gl{stroke-width:2.5}
.snapv{fill:var(--accent-soft);stroke:var(--accent);stroke-width:2;vector-effect:non-scaling-stroke;pointer-events:none}
.snapg{fill:none;stroke:var(--accent);stroke-width:1.5;vector-effect:non-scaling-stroke;pointer-events:none}

#drawer{flex:0 0 auto;border-top:1px solid var(--line);background:var(--chrome);display:none;flex-direction:column;max-height:44vh}
/* Code a tutta area: min-height:0, se no il cassetto cresce quanto il codice e #out non scorre. */
#drawer.open{display:flex;flex:1;max-height:none;min-height:0}
#drawer .bar{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--line);flex-wrap:wrap}
#out{margin:0;padding:12px 14px;overflow:auto;font-family:var(--mono);font-size:12px;line-height:1.55;white-space:pre;background:var(--chrome2);flex:1;min-height:0}
/* Selettore di entità e font: sostituisce le datalist, che su Android e iPad
   finiscono nella barra dei suggerimenti della tastiera. */
#sta button{padding:4px 9px}
#sta button svg{width:18px;height:18px}
#pick{position:absolute;z-index:20;display:flex;flex-direction:column;min-height:0;background:var(--chrome);
  border:1px solid var(--line);border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.22);overflow:hidden}
#pick[hidden]{display:none}
#pick .pkh{display:none;gap:8px;padding:8px 8px 0;flex:0 0 auto}
#pick.coarse .pkh{display:flex}
#pks{flex:1;min-width:0;width:auto;font-size:15px;padding:8px 10px}
#pkd{display:flex;gap:6px;padding:8px;overflow-x:auto;flex:0 0 auto;border-bottom:1px solid var(--line);scrollbar-width:thin}
#pkd[hidden]{display:none}
#pkd button{flex:0 0 auto;background:var(--chrome2);border:1px solid var(--line);border-radius:14px;padding:3px 10px;font-size:12px;cursor:pointer;white-space:nowrap}
#pkd button span{color:var(--ink2);margin-left:4px}
#pkd button[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
#pkl{position:relative;overflow-y:auto;overscroll-behavior:contain;flex:1 1 auto;min-height:0;padding:4px;touch-action:pan-y}
#pkl .o{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:5px;cursor:pointer;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
#pkl .o .t{flex:1;min-width:0}
#pkl .o b{display:block;font-weight:400;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pkl .o small{display:block;font:11px var(--mono);color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pkl .o i{font-style:normal;font-size:11px;color:var(--ink2);flex:0 1 auto;max-width:35%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pkl .o:hover{background:var(--chrome2)}
#pkl .o.act{background:var(--accent-soft)}
#pkl .o.cur b{color:var(--accent);font-weight:600}
#pkl .more{padding:6px 8px;font-size:12px;color:var(--ink2)}
#pkl .o.ph b,#pkl .o.ph small{color:var(--ph)}
#pkl .o .pke{flex:0 0 auto;background:none;border:0;color:var(--ph);cursor:pointer;font-size:14px;padding:2px 6px}
#pkl .phe{padding:6px 6px 8px}
#pkl .phh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
#pkl .phh b{color:var(--ph);font:13px var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#pkl .phe textarea{width:100%;box-sizing:border-box;resize:vertical;font:12px var(--mono)}
input[data-pick="ents"][value^="ada_studio."]{color:var(--ph)}
@media (pointer:coarse){#pkl .o{min-height:44px}#pkd button{padding:6px 12px;font-size:13px}}
/* Campo di percorso con il pulsante Sfoglia accanto. */
.prow{display:flex;gap:6px;align-items:center;margin:3px 0 2px}
.prow .num{flex:1;min-width:0;width:auto}
.prow .btn{flex:0 0 auto;padding:5px 9px}
/* Selettore delle immagini: miniature fatte da HA, a gruppi, solo per le caselle visibili. */
#gal,#cde{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.38);padding:12px}
/* Finestra degli errori (3.24.0): sopra tutto, anche sopra il selettore delle immagini. */
#erd{position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.38);padding:12px}
#erd .ebox{background:var(--chrome);color:var(--ink);border:1px solid var(--line);border-top:3px solid var(--error-color,#c33);border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.3);width:min(420px,100%);padding:14px 16px 12px}
#erd p{margin:0 0 12px;white-space:pre-line;overflow-wrap:anywhere;line-height:1.4}
#erd .row{justify-content:flex-end}
/* Finestra dei bersagli: copre la fascia destra (nei Flows il riquadro), la tela resta libera e un clic su
   un oggetto lo spunta. Righe come il pannello Objects: rientro per livello (--d), gruppi con ▾ ▸ e il numero. */
.twon{position:relative}
#tgw{position:absolute;inset:0;z-index:25;display:flex;flex-direction:column;min-height:0;background:var(--chrome);border-left:1px solid var(--line);box-shadow:-6px 0 18px rgba(0,0,0,.12)}
#tgw .gh{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--line);flex:0 0 auto}
#tgw .gh b{font-size:14px;font-weight:600}
#tgws{flex:1;min-width:0;width:auto}
#tgwl{position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 0}
#tgw .gf{display:flex;justify-content:flex-end;gap:8px;padding:8px 10px;border-top:1px solid var(--line);flex:0 0 auto}
#tgw .gf .btn:disabled{opacity:.4;cursor:default}
#tgwl .tws{display:flex;align-items:center;gap:6px;padding:8px 10px 3px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);cursor:pointer;user-select:none;-webkit-user-select:none}
#tgwl .tws .n{margin-left:auto;letter-spacing:0;color:var(--accent)}
#tgwl .twr{display:flex;align-items:center;gap:6px;padding:3px 10px 3px calc(10px + var(--d,0) * 16px);min-height:28px;cursor:pointer;user-select:none;-webkit-user-select:none}
#tgwl .twr:hover,#tgwl .twr.hv{background:var(--chrome2)}
#tgwl .twr.ck{background:var(--accent-soft)}
#tgwl .twr.cov{color:var(--ink2);cursor:default}
#tgwl .twr.no{opacity:.45;cursor:default}
#tgwl .twr.no:hover{background:none}
#tgwl .twr.hv{box-shadow:inset 3px 0 0 var(--accent)}
#tgwl .twf{width:14px;text-align:center;color:var(--ink2);flex:0 0 auto}
#tgwl .twf:hover{color:var(--accent)}
#tgwl .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tgwl .g .nm{font-weight:600}
#tgwl .gc{font-size:11px;color:var(--ink2);border:1px solid var(--line);border-radius:9px;padding:0 6px}
#tgwl .id{font:11px var(--mono);color:var(--ink2)}
#tgwl .q{color:var(--accent);font-weight:700}
#tgwl .cb{width:16px;height:16px;border:1.5px solid var(--ink2);border-radius:3px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;background:var(--chrome);box-sizing:border-box}
#tgwl .ck>.cb{background:var(--accent);border-color:var(--accent);color:var(--text-primary-color,#fff)}
#tgwl .cov>.cb{background:var(--line);border-color:var(--line);color:var(--text-primary-color,#fff)}
#tgwl .part>.cb{border-color:var(--accent);color:var(--accent)}
#tgwl .no>.cb{border-style:dashed}
#tgwl .hint{margin:12px}
@media (pointer:coarse){#tgwl .twr{min-height:44px}#tgwl .twf{width:28px;padding:8px 0;margin:-8px 0}#tgw .gf .btn{min-height:36px}}
.twt{fill:none;stroke:var(--accent);stroke-width:2;vector-effect:non-scaling-stroke;pointer-events:none}
.twh{fill:var(--accent);fill-opacity:.25;stroke:var(--accent);stroke-width:2;vector-effect:non-scaling-stroke;pointer-events:none}
.twn{fill:none;stroke:var(--ink2);stroke-width:1;stroke-dasharray:3 3;vector-effect:non-scaling-stroke;pointer-events:none}
#cv.twp [data-i]{cursor:pointer}
#tgw[hidden],#erd[hidden],#gal[hidden],#cde[hidden],#galr[hidden],#galp[hidden],#galq[hidden],#galup[hidden],#galf{display:none}
#gal .gbox,#cde .gbox{background:var(--chrome);border:1px solid var(--line);border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.3);
  width:min(960px,100%);height:min(680px,100%);display:flex;flex-direction:column;min-height:0;overflow:hidden}
#gal .gh,#cde .gh{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);flex-wrap:wrap;flex:0 0 auto}
#gal .gh b,#cde .gh b{font-size:14px;font-weight:600}
/* Editor visuale delle card (3.13.0): il selettore e l'editor di HA, a sinistra l'editor e a destra l'anteprima. */
#cde .gbox{width:min(1100px,100%);height:min(820px,100%)}
#cde .gh b{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cdeg{flex:1 1 auto;min-height:0;display:flex}
#cdeg hui-card-picker{flex:1 1 auto;min-width:0}
#cdeg .cdee{flex:1 1 0;min-width:0;overflow-y:auto;overscroll-behavior:contain;padding:12px}
#cdeg .cdep{flex:0 0 42%;min-width:0;overflow:auto;padding:12px;border-left:1px solid var(--line);background:var(--primary-background-color,var(--chrome2))}
#cdeg .cdpb{transform-origin:0 0}
#cdeg .hint{margin:12px}
@media (max-width:760px){#cdeg .cdep{display:none}}
#gals{width:180px;flex:0 1 180px;font-family:inherit}
#galp{padding:6px 12px 0;font-size:12px;color:var(--ink2);white-space:nowrap;overflow-x:auto;flex:0 0 auto}
#galp .crumb{background:none;border:0;padding:2px 3px;cursor:pointer;color:var(--accent);font-size:12px}
#galg{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;padding:10px 12px;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px;align-content:start}
#galg .gt{border:1px solid var(--line);border-radius:7px;background:var(--chrome2);cursor:pointer;overflow:hidden;min-width:0;
  user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
#galg .gt:hover{border-color:var(--accent)}
#galg .gt.cur{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
#galg .im{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;background:var(--chrome);color:var(--ink2)}
#galg .im img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}
#galg .im svg{width:40%;height:40%;fill:currentColor}
#galg .dir .im svg{fill:var(--accent)}
#galg .nm{padding:4px 6px 0;font:11.5px var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#galg .sb{padding:0 6px 5px;font-size:11px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:1.45em}
#galg .ld{width:18px;height:18px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--accent);animation:galspin .8s linear infinite}
@keyframes galspin{to{transform:rotate(360deg)}}
#galg .gnone{grid-column:1/-1}
#galq{border-top:1px solid var(--line);padding:10px 12px 2px;background:var(--chrome2);flex:0 0 auto}
#galq p{margin:0 0 8px;font-size:13px}
#galq p.hint{font-size:12px}
#galq .row{margin-bottom:8px;align-items:center}
#galq .num{flex:1;min-width:140px;width:auto}
#gal .gf{padding:6px 12px 10px;border-top:1px solid var(--line);flex:0 0 auto}
#gal.busy #galg{opacity:.55;pointer-events:none}
@media (pointer:coarse){#gal,#cde{padding:0}#gal .gbox,#cde .gbox{width:100%;height:100%;border-radius:0}
  #galg{grid-template-columns:repeat(auto-fill,minmax(112px,1fr))}#galp .crumb{padding:6px 5px}}
/* Barra di stato in fondo: salvataggio, errori, avvisi. Una riga, il testo intero nel title. */
#sbot{flex:0 0 auto;display:flex;align-items:center;gap:10px;min-height:22px;padding:2px 12px calc(2px + env(safe-area-inset-bottom, 0px));
  border-top:1px solid var(--line);background:var(--chrome2);font-size:12px;color:var(--ink2)}
#st{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* Zoom (dalla 3.10.0; prima nella barra in alto) a destra nella barra in fondo, alto quanto la riga. */
#sbot .seg button{padding:0 8px;font-size:11px;line-height:16px}
#zl{font-family:var(--mono);font-size:11px;min-width:36px;text-align:right}
@media (pointer:coarse){#sbot .seg button{padding:4px 11px;font-size:12px}}
/* Vista Flusso (bozze H-flusso-tela e I-flusso-e-o): colonne di cause ed effetti ai
   lati della tela, linee nello strato #flw sopra tutto, bordi blu nella tela (#flv). */
:host{--flow:#2F7FF0}
#wk{position:relative}
#flines[hidden],#flsort[hidden],#flreal[hidden],.fcol[hidden],#flw[hidden],#fmenu[hidden]{display:none}
.fcol{flex:0 0 var(--fcw,176px);width:var(--fcw,176px);min-height:0;display:flex;flex-direction:column;gap:6px;padding:6px 8px 10px;
  overflow-y:auto;overflow-x:hidden;background:var(--chrome);scrollbar-width:thin;overscroll-behavior:contain}
#fcl{border-right:1px solid var(--line)}
#fcr{border-left:1px solid var(--line)}
/* Icone e miniature delle colonne del 50% più grandi; colonna ridotta da 64 a 80 px. */
.fcol.nar{--fcw:80px;padding-left:6px;padding-right:6px}
.fcol.nar .fit .th{width:45px}
.fch{flex:0 0 auto;display:flex;align-items:center;gap:6px;min-height:28px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.fch .t{flex:1;min-width:0}
.fch button{border:0;background:none;color:var(--ink2);width:28px;height:28px;border-radius:6px;cursor:pointer;flex:0 0 auto;font-size:16px;padding:0}
.fch button:hover{background:var(--chrome2)}
.fcol.nar .fch{justify-content:center}
.fcol.nar .fch .t{display:none}
.fit{position:relative;flex:0 0 auto;border:1px solid var(--line);border-radius:9px;background:var(--chrome);cursor:pointer;touch-action:pan-y;
  user-select:none;-webkit-user-select:none;transition:opacity .15s,border-color .15s}
.fit .row{display:flex;align-items:center;gap:8px;min-height:56px;padding:5px 16px 5px 7px}
#fcr .fit .row{padding:5px 7px 5px 16px}
.fit .ico{width:45px;height:45px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:var(--chrome2);color:var(--ink2)}
.fit .ico svg{width:26px;height:26px;display:block}
.fit.k-cond .ico{background:color-mix(in srgb,#e8a33d 22%,transparent);color:#8a5200}
.fit.k-data .ico{background:color-mix(in srgb,#3cb45a 20%,transparent);color:#1e6b3a}
.fit.now .ico{box-shadow:inset 0 0 0 1.5px var(--accent)}
.fit.frc .ico{color:var(--error-color,#d32f2f)}
/* Una causa simulata (forzata) ha la voce in rosso tenue; così il pulsante Release values. */
.fit.frc{background:color-mix(in srgb,#e53935 9%,var(--chrome));border-color:color-mix(in srgb,#e53935 40%,var(--line))}
#flreal button{color:#a33a35;background:color-mix(in srgb,#e53935 9%,var(--chrome));border-color:color-mix(in srgb,#e53935 40%,var(--line))}
/* Sulla tela del Flusso l'icona di una causa fa da interruttore di prova; piena se la condizione è vera.
   Classe ftg, non tg: tg è degli interruttori della barra e lascerebbe il nome largo 30 px. */
.fit.ftg .ico{cursor:pointer;transition:background .15s}
.fit.ftg .ico:hover{box-shadow:inset 0 0 0 1.5px var(--ink2)}
.fit.ftg.k-cond.now .ico{background:#e8a33d;color:#3a2200}
.fit.ftg.k-cond.now.frc .ico{color:#8b0000}
/* Sotto l'icona di una causa con un'entità: per un dato (valore continuo) una barretta con il pallino al
   valore nella sua scala, per una condizione un interruttore, a destra se vera. */
.fit .ico.fb{flex-direction:column;gap:4px}
.fit .ico.fb svg{width:22px;height:22px}
.fit .ico .fbar,.fit .ico .fsw{display:block;position:relative;flex:0 0 auto;font-style:normal}
.fit .ico .fbar{width:26px;height:2px;border-radius:1px;margin:2px 0;background:color-mix(in srgb,currentColor 40%,transparent)}
.fit .ico .fbar b{position:absolute;top:50%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:currentColor}
.fit .ico .fsw{width:17px;height:9px;border-radius:5px;box-shadow:inset 0 0 0 1.5px currentColor}
.fit .ico .fsw::after{content:"";position:absolute;top:2px;left:2px;width:5px;height:5px;border-radius:50%;background:currentColor;transition:left .15s}
.fit .ico .fsw.on::after{left:10px}
/* Slider di un dato in Test, sotto il nome, aperto dall'icona. */
.fit .fsl{display:flex;align-items:center;gap:6px;padding:0 8px 7px 7px;cursor:default;touch-action:none}
.fit .fsl input{flex:1;min-width:0;margin:0;accent-color:#3cb45a}
.fit .fsl .v{flex:0 0 auto;font-family:var(--mono);font-size:11.5px;text-align:right}
.fit.frc .fsl .v{color:#a33a35}
.fit .fsl .btn{flex:0 0 auto;padding:2px 7px}
.fit .fsl input[type=date],.fit .fsl input[type=time]{flex:0 0 auto;width:auto;padding:2px 4px;font-size:11.5px}
.fit .fsl.fck2{justify-content:flex-end}
.fclk .nm{font-variant-numeric:tabular-nums}
.fcol.nar .fit .fsl{display:none}
.fit.fvm{margin-left:10px}
.fcol.nar .fit.fvm{margin-left:0}
.fit.fvg .nm{color:var(--ink2)}
.fit .th{width:57px;height:42px;border-radius:6px;overflow:hidden;border:1px solid var(--line);flex:0 0 auto;display:flex;align-items:center;justify-content:center;
  background:var(--chrome2);color:var(--ink2);font-size:15px;white-space:nowrap}
.fit .th svg{width:100%;height:100%;display:block}
.fit .th b{font-weight:600;overflow:hidden;text-overflow:ellipsis;max-width:54px}
.fit .nm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12.5px;font-weight:500}
.fit .more{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding:8px 9px 10px;font-size:12px;cursor:default;white-space:normal;overflow-wrap:anywhere}
.fit .more .k{color:var(--ink2);font-size:11px}
.fit .more .mono{font-family:var(--mono);font-size:11.5px}
.fit .more .big{height:72px;border-radius:7px;overflow:hidden;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;background:var(--chrome2);color:var(--ink2);font-size:14px}
.fit .more .big svg{width:100%;height:100%;display:block}
.fit .more .acts{display:flex;flex-direction:column;gap:5px}
.fit .more .btn{padding:5px 8px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fit .fsim{display:flex;gap:6px;align-items:center}
.fit .fsim input{flex:1;min-width:0;width:auto}
.fit .fsim .btn{flex:0 0 auto;padding:4px 9px}
.fit .chip,#fmenu .chip{align-self:flex-start;display:inline-flex;padding:1px 8px;border-radius:999px;font-size:11px;background:var(--chrome2);border:1px solid var(--line);white-space:nowrap}
.fit .port{position:absolute;top:28px;right:4px;width:10px;height:10px;margin-top:-5px;border-radius:50%;background:var(--chrome);border:2px solid #AEB7C3;pointer-events:none}
#fcr .fit .port{left:4px;right:auto;width:9px;height:12px;margin-top:-6px;border:0;border-radius:0;background:#AEB7C3;clip-path:polygon(0 0,100% 50%,0 100%)}
.fcol.nar .fit .more{display:none}
/* Nelle colonne ridotte (Flow + Preview) il nome sotto l'icona o la miniatura, su due righe al massimo. */
.fcol.nar .fit .row{flex-direction:column;align-items:flex-start;gap:3px}
#fcr.nar .fit .row{align-items:flex-end}
.fcol.nar .fit .nm{flex:0 0 auto;width:100%;font-size:10.5px;font-weight:500;line-height:1.2;white-space:normal;overflow-wrap:anywhere;text-align:center;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
#fcl.nar .fit .row,#fcr.nar .fit .row{justify-content:flex-start;padding:5px 4px}
.fit.dim{opacity:.35}
.fit.hi{border-color:var(--flow);box-shadow:0 0 0 1px var(--flow)}
.fit.lit{border-color:color-mix(in srgb,var(--flow) 55%,transparent)}
.fit.hi .port,.fit.lit .port{border-color:var(--flow)}
#fcr .fit.hi .port,#fcr .fit.lit .port{background:var(--flow)}
.fit.pend{border-style:dashed}
.fghost{flex:0 0 auto;font:inherit;font-size:12px;min-height:40px;border-radius:8px;border:1px dashed #AEB7C3;background:transparent;color:var(--ink2);cursor:pointer}
.fghost:hover{border-color:var(--flow);color:var(--ink)}
.fcol.nar .fghost span{display:none}
#flw{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4;overflow:visible}
#flw .fa{pointer-events:all;cursor:pointer;touch-action:none}
#flv{pointer-events:none}
/* Con la tela dei flussi (Flow da solo) la tela del disegno non si vede. */
#wk.fll #work{display:none}
/* Lo zoom della barra in fondo riguarda la tela del disegno: con la tela dei flussi non c'è. */
#sbot.fll :is(#zf,#zc,#zl){display:none}
/* Flow da solo è la tela dei flussi (alla Node-RED), al posto delle colonne: un riquadro per
   gruppo principale, uno interno per sottogruppo, catene causa → oggetto → effetto; a sinistra flussi e cause. */
#fnet{display:none;--fsel:#e53935}
#wk.flow.fll>#fnet:not([hidden]){display:flex;grid-column:1/4;grid-row:1;min-width:0;min-height:0}
#wk.flow.fll.fnt>.fcol,#wk.flow.fll.fnt>.fcg{display:none}
.fnl{flex:0 0 220px;width:220px;display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--line);background:var(--chrome)}
.fnl>input{margin:8px;width:auto}
#fnls{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding-bottom:10px}
#fnls .sh{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);padding:8px 10px 3px}
#fnls .it{display:flex;align-items:center;gap:6px;padding:3px 10px;cursor:pointer;line-height:1.25;border-left:3px solid transparent}
#fnls .it:hover{background:var(--chrome2)}
#fnls .it.on{background:color-mix(in srgb,var(--fsel) 14%,transparent);border-left-color:var(--fsel)}
#fnls .it .t{flex:1;min-width:0}
#fnls .it b{display:block;font-weight:500;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fnls .it i{display:block;font-style:normal;font-size:11px;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fnls .it em{font-style:normal;font-size:11px;color:var(--ink2);background:var(--chrome2);border-radius:8px;padding:0 6px}
#fnls .it.on em{background:var(--fsel);color:#fff}
#fnls .it.lit b::after{content:" ●";color:var(--fsel);font-size:9px}
#fnls .it.off{opacity:.5}
/* Cause con l'entità simulata nell'elenco e sulla tela, nel rosso tenue di Release values e con
   tutto il percorso (la scelta, rossa piena, e il passaggio del mouse vincono). */
#fnls .it.sim{background:color-mix(in srgb,#e53935 9%,transparent)}
#fnls .it.sim b{color:#a33a35}
#fnls .it.ph b,.fit.fph .nm,#list .nm.ph{color:var(--ph)}
.fnc{flex:1;min-width:0;position:relative;overflow:hidden;background-color:var(--paper);touch-action:none;user-select:none;-webkit-user-select:none;
  background-image:radial-gradient(color-mix(in srgb,var(--ink2) 35%,transparent) 1px,transparent 1px)}
.fnc.pan{cursor:grabbing}
#fnw{position:absolute;inset:0;width:100%;height:100%;display:block;font-size:11px}
#fnw text{fill:var(--ink);dominant-baseline:central;pointer-events:none}
#fnw .fr{fill:var(--chrome);stroke:var(--line)}
#fnw .fr.lit{stroke:var(--fsel);stroke-width:1.5}
#fnw .fs{fill:var(--chrome2);stroke:var(--line)}
#fnw .ft{font-size:12px;font-weight:600}
#fnw .fst{font-size:10.5px;font-weight:600;fill:var(--ink2)}
#fnw .fb{font-size:15px;font-weight:600;fill:var(--ink2)}
#fnw .fpd{stroke:color-mix(in srgb,var(--ink2) 55%,transparent);stroke-width:1;vector-effect:non-scaling-stroke}
#fnw .w{fill:none;stroke:#9aa3ad;stroke-width:2}
#fnw .wh{fill:none;stroke:transparent;stroke-width:10;cursor:pointer}
#fnw .n{cursor:pointer}
#fnw .n>rect.b{stroke:#8a939c;stroke-width:1}
#fnw .n .ib{fill:rgba(0,0,0,.08)}
#fnw .n .il{stroke:rgba(0,0,0,.15)}
#fnw .n text{fill:#222}
#fnw .n.o>rect.b{fill:var(--chrome2)}
#fnw .n.o text{fill:var(--ink)}
#fnw .n .gl{color:#333}
#fnw .n.o .gl{color:var(--ink2)}
#fnw .pt{fill:#d9d9d9;stroke:#8a939c}
#fnw .n.sim>rect.b{stroke:color-mix(in srgb,#e53935 55%,transparent);stroke-width:2.5}
#fnw .w.sim{stroke:color-mix(in srgb,#e53935 50%,transparent);stroke-width:2.5}
#fnw .hv.w{stroke:var(--flow);stroke-width:2.5}
#fnw .n.hv>rect.b{stroke:var(--flow);stroke-width:2}
/* La scelta in rosso, più evidente; il passaggio del mouse resta blu. */
#fnw .on.w{stroke:var(--fsel);stroke-width:2.5}
#fnw .n.on>rect.b{stroke:var(--fsel);stroke-width:2.5}
#fnw .ag{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:no-preference){
  #fnw .n:hover .ag.spin{animation:fnspin 1.2s linear infinite}
  #fnw .n:hover .ag.beat{animation:fnbeat 1s ease-in-out infinite}
  #fnw .n:hover .ag.pulse,#fnw .n:hover .ag.blink{animation:fnblink 1s ease-in-out infinite}
  #fnw .n:hover .ag.any{animation:fnbeat 1.4s ease-in-out infinite}}
@keyframes fnspin{to{transform:rotate(360deg)}}
@keyframes fnbeat{0%,60%,100%{transform:none}15%{transform:scale(1.3)}40%{transform:scale(1.15)}}
@keyframes fnblink{50%{opacity:.25}}
#fnm{position:absolute;right:12px;bottom:46px;background:color-mix(in srgb,var(--chrome) 92%,transparent);border:1px solid var(--line);border-radius:5px;cursor:pointer;touch-action:none}
#fnm .m{fill:color-mix(in srgb,var(--ink2) 30%,transparent)}
#fnm .m.lit{fill:color-mix(in srgb,var(--fsel) 55%,transparent)}
#fnm .vp{fill:color-mix(in srgb,var(--flow) 10%,transparent);stroke:var(--flow);vector-effect:non-scaling-stroke;stroke-width:1.5}
.fnz{position:absolute;right:12px;bottom:12px;display:flex;border:1px solid var(--line);border-radius:6px;background:var(--chrome);overflow:hidden}
.fnz button{border:0;border-right:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:12px;min-width:30px;height:26px;padding:0 8px;cursor:pointer}
.fnz button:last-child{border-right:0}
.fnz button:hover{background:var(--chrome2)}
#fnzl{font-family:var(--mono);min-width:50px}
@media (max-width:700px){.fnl{flex-basis:160px;width:160px}#fnm{display:none}}
/* Fascia destra chiusa entrando nel Flusso, riaperta da una scelta; dati che scorrono verso l'oggetto. */
main.flp>aside,main.flp>#wgrip{display:none}
/* Nel Flusso la fascia destra non c'è; il dettaglio della scelta (con la sua barra) sta nel
   riquadro #fdock, alto quanto si trascina, sotto le colonne, a tutta larghezza. */
#wk.flow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr) auto}
#wk.flow>#fcl{grid-column:1;grid-row:1}
#wk.flow>#fcr{grid-column:3;grid-row:1}
#wk.flow>#work{grid-column:2;grid-row:1}
/* Nell'elenco le colonne partono da 1/4 – 2/4 – 1/4 (--flw-l, --flw-r: 1fr, una larghezza
   trascinata o 64px se ridotte); sulla tela la larghezza propria delle colonne (176px o 64px). */
#wk.flow.fll{grid-template-columns:var(--flw-l,1fr) minmax(0,2fr) var(--flw-r,1fr)}
#wk.flow.fll>.fcol{width:auto;min-width:0}
.fcg{display:none}
#wk.flow.fll>.fcg:not([hidden]){display:block;grid-row:1;width:7px;z-index:3;cursor:ew-resize;touch-action:none}
#wk.flow.fll>#fgl{grid-column:1;justify-self:end}
#wk.flow.fll>#fgr{grid-column:3;justify-self:start}
#wk.flow.fll>.fcg:hover,#wk.flow.fll>.fcg.on{background:color-mix(in srgb,var(--accent) 35%,transparent)}
@media (pointer:coarse){#wk.flow.fll>.fcg:not([hidden]){width:16px}}
/* Sulla tela (Flow + Preview) il bordo destro della colonna When si trascina. */
#wk.flow:not(.fll)>#fgl:not([hidden]){display:block;grid-column:1;grid-row:1;justify-self:end;width:7px;z-index:3;cursor:ew-resize;touch-action:none}
#wk.flow:not(.fll)>#fgl:hover,#wk.flow:not(.fll)>#fgl.on{background:color-mix(in srgb,var(--accent) 35%,transparent)}
@media (pointer:coarse){#wk.flow:not(.fll)>#fgl:not([hidden]){width:16px}}
#fdock{display:none}
#wk.flow>#fdock:not([hidden]){display:flex;flex-direction:column;grid-column:1/4;grid-row:2;height:var(--fdh,280px);min-height:0;min-width:0;
  position:relative;z-index:5;background:var(--chrome);border-top:1px solid var(--line)}
#fdgrip{flex:0 0 auto;height:12px;cursor:ns-resize;touch-action:none;display:flex;align-items:center;justify-content:center}
#fdgrip::after{content:'';width:40px;height:4px;border-radius:2px;background:var(--line)}
#fdgrip:hover::after,#fdgrip.on::after{background:var(--accent)}
@media (pointer:coarse){#fdgrip{height:20px}}
/* Con la tela dei flussi il riquadro del dettaglio è una colonna a destra, larga quanto si
   trascina dal bordo sinistro (da 260 px all'area meno 320, ricordata nel browser, doppio clic = 360 px). Sotto i 700 px
   e in Flow + Preview resta in basso. */
@media (min-width:701px){
  #wk.flow.fll.fnt{grid-template-columns:minmax(0,1fr) auto;grid-template-rows:minmax(0,1fr)}
  #wk.flow.fll.fnt>#fnet:not([hidden]){grid-column:1}
  #wk.flow.fll.fnt>#fdock:not([hidden]){grid-column:2;grid-row:1;height:auto;width:var(--fdw,360px);border-top:0;border-left:1px solid var(--line)}
  /* Bordo più facile da vedere e da prendere: 16 px (24 al tocco), trattino scuro a metà,
     al passaggio una riga del colore d'accento per tutta l'altezza. */
  #wk.fnt #fdgrip{position:absolute;left:-8px;top:0;bottom:0;width:16px;height:auto;z-index:6;cursor:ew-resize}
  #wk.fnt #fdgrip::after{width:4px;height:48px;background:color-mix(in srgb,var(--ink2) 55%,transparent)}
  #wk.fnt #fdgrip:hover,#wk.fnt #fdgrip.on{background:linear-gradient(to right,transparent 7px,var(--accent) 7px,var(--accent) 9px,transparent 9px)}
  #wk.fnt #fdgrip:hover::after,#wk.fnt #fdgrip.on::after{background:var(--accent)}
  #wk.fnt #fdock .fdh{padding-top:8px}
}
@media (pointer:coarse) and (min-width:701px){#wk.fnt #fdgrip{left:-12px;width:24px;background:linear-gradient(to right,transparent 11px,var(--line) 11px,var(--line) 13px,transparent 13px)}}
#fdock .fdh{flex:0 0 auto;display:flex;align-items:center;gap:8px;padding:0 10px 4px 14px;min-height:26px}
#fdtit{flex:1;min-width:0;font-size:12.5px;font-weight:600;color:var(--ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#fdock .abar{padding:0;min-height:22px}
#fdx{background:none;border:1px solid var(--line);border-radius:4px;width:24px;height:24px;padding:0;cursor:pointer;color:var(--ink2);flex:0 0 auto}
@media (pointer:coarse){#fdx{width:36px;height:36px}}
#fdbody{flex:1;min-height:0;display:flex}
#fdock #detail{flex:1;min-width:0;padding:6px 14px 14px;border-top:1px solid var(--line)}
/* Il riquadro è largo: i pannelli vanno su colonne di circa 300 px, i campi non si spezzano. */
#fdock .ipane,#fdock #rupanel,#fdock #bgpanel,#fdock #projpanel{columns:300px auto;column-gap:28px}
/* Nel riquadro niente cornici (si spezzavano tra le colonne); lo stile va per gruppi:
   nome e anteprima, colore, bordo ed effetti, movimento, testo. */
#fdock section,#fdock section:last-child{border:0;padding-bottom:0}
#fdock .sub{border-top:0;padding-top:0}
#fdock #stpanel .stw{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0 28px;align-items:start}
#fdock #stpanel .stg{min-width:0;margin:0}
#fdock #stpanel .stg>h3:first-child{margin-top:0}
#fdock #stpanel .stid #stsw{margin-top:4px}
#fdock #detail :is(.f,.row,.prow,.sub,.tbx,.slr,.rch,.seg,.hint,.chk,.bhl,.bhr,label,section){break-inside:avoid}
#fdock #detail :is(h2,h3){break-after:avoid}
/* Nel riquadro un oggetto mostra solo Settings: aspetto e comportamento si danno nel Flusso. */
#fdock #insp .itabs{display:none}
#fdock #insp .ipane:not([data-pane="set"]){display:none}
#fdock #insp .ipane[data-pane="set"]{display:block}
#flw .frun{animation:flrun .6s linear infinite}
@keyframes flrun{to{stroke-dashoffset:-12}}
@media (prefers-reduced-motion:reduce){#flw .frun{animation:none}}
#cv .flo{fill:none;stroke:var(--flow);stroke-width:2;vector-effect:non-scaling-stroke}
#cv .flo.hi{stroke-width:3}
#fmenu{position:absolute;z-index:6;background:var(--chrome);color:var(--ink);border:1px solid var(--flow);border-radius:9px;
  box-shadow:0 8px 24px rgba(10,20,35,.28);padding:8px 9px;font-size:12px;width:250px;max-height:60%;overflow-y:auto;display:flex;flex-direction:column;gap:5px}
#fmenu .evb{background:none;border:1px solid var(--line);border-radius:4px;width:24px;height:24px;padding:0;cursor:pointer;color:var(--ink2);flex:0 0 auto}
#fmenu .rn,#fmenu .dh{font-weight:600}
#fmenu .dh{font-weight:400;color:var(--ink2);display:flex;align-items:center;gap:6px}
#fmenu .opt{display:flex;flex-direction:column;gap:1px;padding:6px 8px;border-radius:6px;border:1px solid transparent;background:none;text-align:left;font:inherit;color:inherit;cursor:pointer}
#fmenu .opt:hover:not(:disabled){background:var(--chrome2);border-color:var(--line)}
#fmenu .opt:disabled{opacity:.45;cursor:default}
#fmenu .opt b{font-weight:600;font-size:12.5px}
#fmenu .opt span{color:var(--ink2);font-size:11px}
@media (pointer:coarse){.fch button{width:40px;height:40px}#fmenu .evb{width:36px;height:36px}#fmenu .opt{min-height:44px}}
@media (max-width:900px){
  main{flex-direction:column}
  aside{width:auto;flex:0 0 46vh;max-width:none;border-top:1px solid var(--line)}
  #wgrip{display:none}
  #stage{padding:10px}
}
</style>
<style id="stcss"></style>
<style id="pccss"></style>

<header>
  <button class="btn" id="menu" title="Menu" aria-label="Menu" style="display:none">
    <svg viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/></svg></button>
  <h1><button type="button" id="pmb" aria-haspopup="menu" aria-expanded="false" title="Project menu">Ada Studio</button></h1>
  <button type="button" id="ptl" title="Project menu"><span id="pname"></span><span id="pdot" hidden></span></button>
  <button type="button" id="pgb" aria-haspopup="menu" aria-expanded="false" title="Page" hidden>›<span id="pgn"></span></button>
  <div id="mtab" role="tablist" aria-label="View">
    <button type="button" role="tab" id="edit" aria-selected="true">Edit</button>
    <button type="button" role="tab" id="fltest" aria-selected="false" title="Test: causes and effects on the canvas">Test</button>
    <button type="button" role="tab" id="flow" aria-selected="false" title="Flows: rules as chains cause → object → effect">Flows</button>
    <button type="button" role="tab" id="exp" aria-selected="false">Code</button>
  </div>
  <div class="seg" id="flines" role="group" aria-label="Lines" hidden>
    <button type="button" data-fl="sel" aria-pressed="true" title="Lines of the selection only">Selected</button><button type="button" data-fl="all" aria-pressed="false" title="All lines, faded">All lines</button>
  </div>
  <button class="btn" id="flsort" title="Sort causes and effects by the position of their objects" hidden>Sort</button>
  <div class="seg" id="flreal" hidden><button type="button" title="Back to the real values of all simulated entities">Release values</button></div>
  <div class="seg" id="uc">
    <button data-u="undo" title="Undo (Ctrl+Z)">↶</button>
    <button data-u="redo" title="Redo (Ctrl+Shift+Z)">↷</button>
  </div>
  <div class="seg" id="xf" role="group" aria-label="Transform">
    <button type="button" data-xf="l" title="Rotate left 90°" aria-label="Rotate left 90°" disabled><svg viewBox="0 0 24 24"><path d="M13,4.07V1L8.45,5.55L13,10V6.09C15.84,6.57 18,9.03 18,12C18,14.97 15.84,17.43 13,17.91V19.93C16.95,19.44 20,16.08 20,12C20,7.92 16.95,4.56 13,4.07M7.1,18.32C8.26,19.22 9.61,19.76 11,19.93V17.9C10.13,17.75 9.29,17.41 8.54,16.87L7.1,18.32M6.09,13H4.07C4.24,14.39 4.79,15.73 5.69,16.89L7.1,15.47C6.58,14.72 6.23,13.88 6.09,13M7.11,8.53L5.7,7.11C4.8,8.27 4.24,9.61 4.07,11H6.09C6.23,10.13 6.58,9.28 7.11,8.53Z"/></svg></button>
    <button type="button" data-xf="r" title="Rotate right 90°" aria-label="Rotate right 90°" disabled><svg viewBox="0 0 24 24"><path d="M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z"/></svg></button>
    <button type="button" data-xf="h" title="Flip horizontal (Shift+H)" aria-label="Flip horizontal (Shift+H)" disabled><svg viewBox="0 0 24 24"><path d="M15 21H17V19H15M19 9H21V7H19M3 5V19C3 20.1 3.9 21 5 21H9V19H5V5H9V3H5C3.9 3 3 3.9 3 5M19 3V5H21C21 3.9 20.1 3 19 3M11 23H13V1H11M19 17H21V15H19M15 5H17V3H15M19 13H21V11H19M19 21C20.1 21 21 20.1 21 19H19Z"/></svg></button>
    <button type="button" data-xf="v" title="Flip vertical (Shift+V)" aria-label="Flip vertical (Shift+V)" disabled><svg viewBox="0 0 24 24"><path d="M3 15V17H5V15M15 19V21H17V19M19 3H5C3.9 3 3 3.9 3 5V9H5V5H19V9H21V5C21 3.9 20.1 3 19 3M21 19H19V21C20.1 21 21 20.1 21 19M1 11V13H23V11M7 19V21H9V19M19 15V17H21V15M11 19V21H13V19M3 19C3 20.1 3.9 21 5 21V19Z"/></svg></button>
  </div>
  <span class="snap" role="group" aria-labelledby="snl"><span id="snl">Snap to:</span>
    <label class="tg" title="Shapes"><input type="checkbox" id="sv" aria-label="Shapes"><span><svg viewBox="0 0 24 24"><path d="M2,2V8H4.28L5.57,16H4V22H10V20.06L15,20.05V22H21V16H19.17L20,9H22V3H16V6.53L14.8,8H9.59L8,5.82V2M4,4H6V6H4M18,5H20V7H18M6.31,8H7.11L9,10.59V14H15V10.91L16.57,9H18L17.16,16H15V18.06H10V16H7.6M11,10H13V12H11M6,18H8V20H6M17,18H19V20H17"/></svg></span></label>
    <label class="tg" title="Guides"><input type="checkbox" id="gdon" aria-label="Guides"><span><svg viewBox="0 0 24 24"><path d="M7,6H9V22H7ZM2,15H20V17H2ZM4.5,2H11.5L8,5.5ZM21,12.5V19.5L17.5,16Z"/></svg></span></label>
    <label class="tg" title="Grid"><input type="checkbox" id="sg" checked aria-label="Grid"><span><svg viewBox="0 0 24 24"><path d="M10,4V8H14V4H10M16,4V8H20V4H16M16,10V14H20V10H16M16,16V20H20V16H16M14,20V16H10V20H14M8,20V16H4V20H8M8,14V10H4V14H8M8,8V4H4V8H8M10,14H14V10H10V14M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4C2.92,22 2,21.1 2,20V4A2,2 0 0,1 4,2Z"/></svg></span></label>
    <input class="num" id="gs" type="number" min="2" max="1000" step="1" style="width:60px" title="Grid step" aria-label="Grid step">
  </span>
</header>
  <nav id="tools" role="toolbar" aria-orientation="horizontal" aria-label="Tools">
    <button data-t="select" aria-pressed="true" title="Select" aria-label="Select">
      <svg viewBox="0 0 24 24"><path d="M5 3l14 8.5-6.1 1.3L9.6 19z"/></svg></button>
    <button data-t="hand" aria-pressed="false" title="Pan (H or hold Space)" aria-label="Pan">
      <svg viewBox="0 0 24 24"><path d="M8 12.5V6.5a1.5 1.5 0 0 1 3 0V11M11 10.5V5a1.5 1.5 0 0 1 3 0v5.5M14 10.5V6.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.6a5 5 0 0 1-3.9-1.9L4 14.8a1.4 1.4 0 0 1 2.1-1.9L8 14.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    <span class="rsep"></span>
    <button data-t="poly" aria-pressed="false" title="Freehand polygon" aria-label="Polygon">
      <svg viewBox="0 0 24 24"><path d="M3 14L8 4L13 9L21 6L18 20L9 18z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><g fill="currentColor"><circle cx="3" cy="14" r="1.7"/><circle cx="8" cy="4" r="1.7"/><circle cx="13" cy="9" r="1.7"/><circle cx="21" cy="6" r="1.7"/><circle cx="18" cy="20" r="1.7"/><circle cx="9" cy="18" r="1.7"/></g></svg></button>
    <button data-t="line" aria-pressed="false" title="Open line" aria-label="Line">
      <svg viewBox="0 0 24 24"><path d="M3 18C7 18 7 7 12 7S16 15 21 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M21 6l-1.2 4.3M21 6l-4.3 1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="3" cy="18" r="1.7" fill="currentColor"/></svg></button>
    <button data-t="reg" aria-pressed="false" title="Regular polygon" aria-label="Regular polygon">
      <svg viewBox="0 0 24 24"><path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
    <button data-t="rect" aria-pressed="false" title="Rectangle" aria-label="Rectangle">
      <svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
    <button data-t="circle" aria-pressed="false" title="Circle" aria-label="Circle">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
    <button data-t="ring" aria-pressed="false" title="Ring sector" aria-label="Sector">
      <svg viewBox="0 0 24 24"><path d="M4.3 15.6a8.5 8.5 0 0 1 4.6-11.1M8.2 14a4.2 4.2 0 0 1 2.3-5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4.3 15.6L8.2 14M8.9 4.5l1.6 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button data-t="callout" aria-pressed="false" title="Callout" aria-label="Callout">
      <svg viewBox="0 0 24 24"><path d="M5.5 4.5h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4.5 4v-4h-1a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
    <button data-t="card" aria-pressed="false" title="Home Assistant card" aria-label="Card">
      <svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9h6M7 12.5h10M7 16h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
    <span class="rsep"></span>
    <button data-t="label" aria-pressed="false" title="Value label" aria-label="Label">
      <svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h9M5 18h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <button data-t="icon" aria-pressed="false" title="State icon" aria-label="Icon">
      <svg viewBox="0 0 24 24"><path d="M12 3l2.4 5.6 6 .5-4.6 4 1.4 5.9L12 15.9 6.8 19l1.4-5.9-4.6-4 6-.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
  </nav>
<div id="pgmenu" role="menu" aria-label="Pages" hidden></div>
<div id="pmenu" role="menu" aria-label="Project" hidden>
  <div class="pmv" id="pmcmd">
    <button type="button" role="menuitem" id="psave">Save project<kbd>Ctrl+S</kbd></button>
    <button type="button" role="menuitem" id="push">Update dashboard</button>
    <button type="button" role="menuitem" id="pdash">Create dashboard</button>
    <hr>
    <button type="button" role="menuitem" id="popen">Open project…</button>
    <button type="button" role="menuitem" id="pnew">New project…</button>
    <button type="button" role="menuitem" id="pdup">Duplicate project…</button>
    <button type="button" role="menuitem" id="pdel">Delete project…</button>
    <hr>
    <button type="button" role="menuitem" id="pgnew0">New page</button>
    <hr id="pgnew0s">
    <button type="button" role="menuitem" id="save">Download file</button>
    <button type="button" role="menuitem" id="load">Import file…</button>
    <input type="file" id="loadf" accept=".json" style="display:none">
  </div>
  <div class="pmv" id="pmlist" hidden>
    <button type="button" class="pmback" id="pback">‹ Open project</button>
    <div id="plist"></div>
  </div>
  <p class="hint" id="pmsg"></p>
</div>

<main>
  <div id="wk">
  <div id="fcl" class="fcol" role="list" aria-label="Causes" hidden></div>
  <div id="work">
  <button id="rcorner" type="button" aria-pressed="false" title="Lock guides" aria-label="Lock guides"><svg viewBox="0 0 24 24"><path id="lockp" d="M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z"/></svg></button>
  <div class="ruler" id="rtop"><canvas></canvas></div>
  <div class="ruler" id="rleft"><canvas></canvas></div>
  <div id="stage">
    <svg id="cv" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="gp" patternUnits="userSpaceOnUse"><path id="gpp" fill="none" stroke="var(--grid)" stroke-width="1"/></pattern></defs>
      <defs id="sdefs"></defs>
      <defs id="codefs"></defs>
      <g id="clips"></g>
      <defs id="pgdefs"></defs>
      <rect id="gb" x="0" y="0" width="100%" height="100%" fill="url(#gp)"/>
      <g id="bgl" pointer-events="none"></g>
      <g id="shapes"></g>
      <g id="cards"></g>
      <g id="flv"></g>
      <g id="gdl"></g>
      <g id="ov"></g>
    </svg>
  </div>
  </div>
  <div id="fnet" hidden>
    <div class="fnl"><input type="search" class="num" id="fnq" placeholder="Find cause, entity, object" aria-label="Find"><div id="fnls" role="list"></div></div>
    <div class="fnc" id="fnc"><svg id="fnw" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="fn-chk" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#fff"/><rect width="2.5" height="2.5" fill="#ddd"/><rect x="2.5" y="2.5" width="2.5" height="2.5" fill="#ddd"/></pattern></defs><g id="fnv"></g></svg>
      <svg id="fnm" xmlns="http://www.w3.org/2000/svg"></svg>
      <div class="fnz"><button type="button" data-fnz="-" title="Zoom out" aria-label="Zoom out">−</button><button type="button" data-fnz="1" id="fnzl" title="100%">100%</button><button type="button" data-fnz="+" title="Zoom in" aria-label="Zoom in">+</button><button type="button" data-fnz="fit" title="Fit">Fit</button></div>
    </div>
  </div>
  <div id="fcr" class="fcol" role="list" aria-label="Effects" hidden></div>
  <div id="fgl" class="fcg" data-flg="l" title="Drag to resize" hidden></div>
  <div id="fgr" class="fcg" data-flg="r" title="Drag to resize" hidden></div>
  <div id="fdock" hidden>
    <div id="fdgrip" title="Drag to resize"></div>
    <div class="fdh"><span id="fdtit"></span><span id="fdbar"></span><button type="button" id="fdx" class="evb" title="Close" aria-label="Close panel">✕</button></div>
    <div id="fdbody"></div>
  </div>
  <svg id="flw" xmlns="http://www.w3.org/2000/svg" hidden></svg>
  <div id="fmenu" role="menu" hidden></div>
  </div>
  <div id="wgrip"></div>
  <aside>
    <div class="ahead">
      <div id="ltab" role="tablist" aria-label="List">
        <button type="button" role="tab" data-tab="p" aria-selected="true">Objects</button>
        <button type="button" role="tab" data-tab="r" aria-selected="false">Rules</button>
        <button type="button" role="tab" data-tab="s" aria-selected="false">Styles</button>
        <button type="button" role="tab" data-tab="a" aria-selected="false">Motions</button>
      </div>
    </div>
    <div class="abar">
      <div id="rbar" role="toolbar" aria-label="Rules" hidden>
      <button type="button" data-rb="newr" title="New rule" aria-label="New rule"><svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg></button>
      <button type="button" data-rb="dup" title="Duplicate" aria-label="Duplicate"><svg viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg></button>
      <button type="button" data-rb="up" title="Higher priority" aria-label="Higher priority"><svg viewBox="0 0 24 24"><path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/></svg></button>
      <button type="button" data-rb="down" title="Lower priority" aria-label="Lower priority"><svg viewBox="0 0 24 24"><path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"/></svg></button>
      <button type="button" data-rb="del" title="Delete" aria-label="Delete"><svg viewBox="0 0 24 24"><path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"/></svg></button>
      </div>
      <div id="tbar" role="toolbar" aria-label="Test" hidden>
      <button type="button" data-tb="real" title="Back to real values" aria-label="Back to real values"><svg viewBox="0 0 24 24"><path d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z"/></svg></button>
      </div>
      <div id="sbar" role="toolbar" aria-label="Styles" hidden>
      <button type="button" data-sb="new" title="New style" aria-label="New style"><svg viewBox="0 0 24 24"><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/></svg></button>
      <button type="button" data-sb="newg" title="New group" aria-label="New group"><svg viewBox="0 0 24 24"><path d="M13 19C13 19.34 13.04 19.67 13.09 20H4C2.9 20 2 19.11 2 18V6C2 4.89 2.89 4 4 4H10L12 6H20C21.1 6 22 6.89 22 8V13.81C21.39 13.46 20.72 13.22 20 13.09V8H4V18H13.09C13.04 18.33 13 18.66 13 19M20 18V15H18V18H15V20H18V23H20V20H23V18H20Z"/></svg></button>
      <button type="button" data-sb="dup" title="Duplicate style" aria-label="Duplicate style"><svg viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg></button>
      <button type="button" data-sb="del" title="Delete style" aria-label="Delete style"><svg viewBox="0 0 24 24"><path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"/></svg></button>
      </div>
      <div id="ibar" role="toolbar" aria-label="Selection">
      <button type="button" data-msel aria-pressed="false" title="Multi-select: each tap adds or removes" aria-label="Multi-select"><svg viewBox="0 0 24 24"><path d="M20,16V4H8V16H20M22,16A2,2 0 0,1 20,18H8C6.89,18 6,17.1 6,16V4C6,2.89 6.89,2 8,2H20A2,2 0 0,1 22,4V16M16,20V22H4A2,2 0 0,1 2,20V7H4V20H16M13,14L9,10L10.41,8.58L13,11.17L17.59,6.58L19,8L13,14Z"/></svg></button>
      <button type="button" data-ib-z="up" title="Forward" aria-label="Forward" disabled><svg viewBox="0 0 24 24"><path d="M2,2H16V16H2V2M22,8V22H8V18H10V20H20V10H18V8H22Z"/></svg></button>
      <button type="button" data-ib-z="down" title="Backward" aria-label="Backward" disabled><svg viewBox="0 0 24 24"><path d="M2,2H16V16H2V2M22,8V22H8V18H18V8H22M4,4V14H14V4H4Z"/></svg></button>
      <button type="button" data-ib-z="dup" title="Duplicate (Ctrl+D)" aria-label="Duplicate (Ctrl+D)" disabled><svg viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg></button>
      <button type="button" data-ib-z="del" title="Delete" aria-label="Delete" disabled><svg viewBox="0 0 24 24"><path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"/></svg></button>
      </div></div>
    <div id="list"></div>
    <div id="grip"></div>
    <div id="detail">
      <div id="dsp"></div>
      <div id="insp"></div>

      <div id="bgpanel">
        <h2>Background</h2>
        <label class="f">Fit type
          <select class="num" id="bgfit" style="flex:1;min-width:0">
            <option value="fill">stretch</option>
            <option value="contain">contain</option>
            <option value="cover">cover</option>
          </select></label>
        <div id="blpanel"></div>
      </div>

      <div id="pgpanel"></div>

      <div id="stpanel"></div>

      <div id="rupanel"></div>

      <div id="tepanel"></div>

      <div id="gpanel">
        <h2 id="gtit">Guide</h2>
        <label class="f">position<input class="num" id="gpos" type="number" step="1"></label>
        <p class="hint" id="gatt" style="margin:2px 0 6px"></p>
        <div class="row" style="margin-top:4px"><button class="btn" id="gdel">Delete guide</button><button class="btn" id="gdet">Detach all</button></div>
      </div>

      <div id="projpanel">
        <h2>Project</h2>
        <label class="f">canvas width<input class="num" id="cw" type="number" step="10"></label>
        <label class="f">canvas height<input class="num" id="ch" type="number" step="10"></label>
        <label class="f">aspect ratio<select class="num" id="ratio"></select></label>
        <p class="hint" id="fold"></p>
        <div id="pgsz"></div>
        <p class="hint" id="pver"></p>
      </div>
    </div>
  </aside>
</main>

<div id="drawer">
  <div class="bar">
    <div class="seg" id="tabs">
      <button data-x="svg" aria-pressed="true">SVG</button>
      <button data-x="yaml" aria-pressed="false">YAML</button>
      <button data-x="css" aria-pressed="false">CSS</button>
      <button data-x="conf" aria-pressed="false">Config</button>
    </div>
    <div class="sp"></div>
    <button class="btn" id="copy">Copy</button>
    <button class="btn" id="dl">Download</button>
    <button class="btn" id="close">Close</button>
  </div>
  <pre id="out"></pre>
</div>
<footer id="sbot"><span id="st" role="status" aria-live="polite"></span>
  <div class="seg" id="zf"><button type="button" aria-pressed="false" title="Fit (0)">Fit</button></div>
  <div class="seg" id="zc">
    <button data-z="-">−</button><button data-z="1">100%</button><button data-z="+">+</button>
  </div>
  <span id="zl">100%</span>
</footer>
<div id="pick" hidden>
  <div class="pkh">
    <input class="num" id="pks" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
      enterkeyhint="search" placeholder="Search by name or id" aria-label="Search">
    <button class="btn" id="pkx" type="button">Close</button>
  </div>
  <div id="pkd" role="group" aria-label="Filter by domain"></div>
  <div id="pkl" role="listbox"></div>
</div>
<div id="gal" hidden role="dialog" aria-modal="true" aria-labelledby="galt">
  <div class="gbox">
    <div class="gh">
      <b id="galt">Choose a photo</b>
      <div class="seg" id="galr" role="group" aria-label="Photo source"></div>
      <button class="btn" id="galup" type="button">From device…</button>
      <input type="file" id="galf" hidden accept="image/jpeg,image/png,image/webp,image/gif,image/avif">
      <div class="sp"></div>
      <input class="num" id="gals" type="text" placeholder="Filter by name" aria-label="Filter by name"
        autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search">
      <button class="btn" id="galx" type="button">Close</button>
    </div>
    <div id="galp" hidden></div>
    <div id="galg" role="listbox"></div>
    <div id="galq" hidden></div>
    <div class="gf">
      <p class="hint" id="galm" style="margin:0"></p>
      <p class="hint" id="galh" style="margin:2px 0 0"></p>
    </div>
  </div>
</div>
<div id="cde" hidden role="dialog" aria-modal="true" aria-labelledby="cdet">
  <div class="gbox">
    <div class="gh">
      <b id="cdet"></b>
      <div class="sp"></div>
      <button class="btn" id="cdeb" type="button" hidden>Change type</button>
      <button class="btn" id="cdex" type="button">Close</button>
    </div>
    <div id="cdeg"></div>
  </div>
</div>
<div id="tgw" hidden role="dialog" aria-labelledby="tgwt">
  <div class="gh"><b id="tgwt"></b><input class="num" id="tgws" type="text" placeholder="Search" aria-label="Search"
    autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search"></div>
  <div id="tgwl" role="tree"></div>
  <div class="gf"><button class="btn" id="tgwx" type="button">Cancel</button><button class="btn go" id="tgwok" type="button">OK</button></div>
</div>
<div id="erd" hidden role="alertdialog" aria-modal="true" aria-labelledby="erdt">
  <div class="ebox"><p id="erdt"></p><div class="row"><button class="btn" id="erdok" type="button">OK</button></div></div>
</div>
`;

class AdaStudio extends HTMLElement {
  constructor(){ super(); this.attachShadow({mode:'open'}); this._built=false; this._folder='www/ada_studio'; this._narrow=false; }
  set hass(h){ this._hraw=h; this._hass=h; if(this._api) this._api.hass(); }
  get hass(){ return this._hass; }
  set narrow(n){ this._narrow=!!n; if(this._api) this._api.chrome(); }
  get narrow(){ return this._narrow; }
  set panel(p){ this._panel=p; if(p && p.config && p.config.folder) this._folder=p.config.folder; if(this._api) this._api.chrome(); }
  connectedCallback(){ if(!this._built){ this._built=true; this._build(); } else if(this._api) this._api.start(); }
  disconnectedCallback(){ if(this._api) this._api.stop(); }

  _build(){
    const self=this, root=this.shadowRoot;
    const LOC=()=>{const h=self._hass,l=(h&&h.locale&&h.locale.language)||(h&&h.language)||'';
      try{return l&&Intl.DateTimeFormat.supportedLocalesOf([l]).length?l:undefined;}catch(_){return undefined;}};
    root.innerHTML=TEMPLATE;
    const $=s=>root.querySelector(s);
    const cv=$('#cv'),gShapes=$('#shapes'),gGd=$('#gdl'),gOv=$('#ov'),gClips=$('#clips'),gCo=$('#codefs'),stage=$('#stage');
    const E={};
    ['zl','ibar','sbar','rbar','tbar','rupanel','tepanel','ltab','wk','fcl','fcr','fgl','fgr','fdock','fdgrip','fdtit','fdbar','fdbody','fdx','detail','flw','flv','fnet','fnq','fnls','fnc','fnw','fnv','fnm','fnzl','sbot','fltest','edit','exp','fmenu','flines','flsort','flreal','flow','gp','gpp','gb','sg','sv','bgl','list','insp','bgpanel','projpanel','stpanel','stcss','pccss','sdefs','st','out','menu','fold','ratio','gdon','gpanel','gpos','gtit','rtop','rleft','rcorner','lockp','pname','plist','pmsg','pmenu','pmb','ptl','pdot','pmcmd','pmlist','pgpanel','pgsz','pgb','pgn','pgmenu']
      .forEach(k=>{E[k]=$('#'+k);});
    E.main=$('main');
    E.cards=$('#cards');
    const PK={el:$('#pick'),s:$('#pks'),d:$('#pkd'),l:$('#pkl'),field:null,kind:'',q:'',dom:'',act:-1,rows:[],setting:false,raf:0,ed:null};
    const uB=root.querySelector('#uc [data-u="undo"]'),rB=root.querySelector('#uc [data-u="redo"]');
    const f=n=>Math.round(n*100)/100;
    const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    const slug=s=>String(s).replace(/[^a-zA-Z0-9_-]/g,'-');
    const coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
    const put=(el,h)=>{if(el._h!==h){el._h=h;el.innerHTML=h;}};
    const SVGNS='http://www.w3.org/2000/svg';
    let GM=null;
    function giro(fn){if(GM)return fn();GM={};try{return fn();}finally{GM=null;}}
    let spOut=false;
    function outF(fn){
      if(spOut)return fn();
      const g=GM;spOut=true;GM=null;
      try{return giro(fn);}finally{spOut=false;GM=g;}
    }
    function mem(k,x,fn){if(!GM)return fn();const T=GM[k]||(GM[k]=new Map());if(T.has(x))return T.get(x);const v=fn();T.set(x,v);return v;}
    function syncKids(g,parts){
      const k=g.children;
      for(let i=0;i<parts.length;i++){
        const c=k[i];
        if(c&&c._h===parts[i])continue;
        const t=document.createElementNS(SVGNS,'g');t.innerHTML=parts[i];
        const n=t.firstElementChild;n._h=parts[i];
        if(c)g.replaceChild(n,c);else g.appendChild(n);
      }
      while(k.length>parts.length)g.lastElementChild.remove();
    }

    let S,tool='select',sel=-1,draft=null,drag=null,tab='svg',zoom=1,zFit=false,stSz=null;
    let selPg=false;
    let selBg=false,saveErr=null,savedAt=null,stT=null,snT=null,outT=null,raf=0,hist=[],hi=-1,drawerOpen=false;
    let selG=-1,gdrag=null,glock=false;
    let inspObj,fadeIn=false,lastSt=[],lastGeo='',lastClips='',lastCo='';
    let ms=[],ldrag=null,skipClick=false,lastShown='';
    let msel=false,lAnc=null;
    const phCur=new Map();
    let selGrp=null,gIn=null,hovG=null,TW=null;
    let proj='',projects=[],projOpen=false,saved='';
    let rifH='',opening=false;
    const ovN=new Map();
    let stGrpCur='',selSt=false,stAn=false,stCur=0,stKey='',stLast='',stMs=[];
    let selRu=false,ruCur='';
    let drR=null,drR0='',drK=[],drC=null,drN=0;
    let selTe=false,teCur='';
    let flVal=false,flTap=false,flow=false,flAll=false,flFoc=null,flOpen='',flPend=[],flMenu=null,flDrag=null,flRu='',flRaf=0,flSkip=false,flPanel=false,flCv=false;

    const ST_SEC=['f','b','g','o','m','v','x','t','a'];
    const stUseOf=st=>Array.isArray(st&&st.use)?ST_SEC.filter(k=>st.use.indexOf(k)>=0):ST_SEC.filter(k=>k!=='m'&&k!=='x'&&k!=='v');
    const stHas=(st,k)=>stUseOf(st).indexOf(k)>=0;
    const ST_P={f:'c',fc:'#8291aa',fa:.1,fc2:'#ffffff',fa2:0,fg:90,sc:'#8291aa',sa:.55,sw:1,sd:'',g:false,gc:'#000000',ga:.5,gb:6,gx:0,gy:2,op:1,mx:0,my:0,mr:0,ms:100};
    const bmOf=p=>BLENDS.indexOf(p&&p.bm)>=0?p.bm:'normal';
    const ST_DEF={dur:150,ease:'ease',anim:'',hov:false,st:{n:Object.assign({},ST_P,{fc:'#000000',fa:0,sw:0})}};
    const ST_NEW={f:'c',fc:'#4a90d9',fa:.25,fc2:'#ffffff',fa2:0,fg:90,sc:'#4a90d9',sa:.8,sw:2,sd:'',g:false,gc:'#4a90d9',ga:.8,gb:8,gx:0,gy:0,op:1,mx:0,my:0,mr:0,ms:100};
    const isAn=x=>!!x&&x.k==='a';
    const AN_F=['anim','ad','ar','al','ai','ac','aa','ap','a0','a1','ae','ax','ay','pp','ps','pv'];
    const newStyle=(id,n)=>({id:id,n:n,dur:300,ease:'ease',anim:'',hov:true,use:['f','b'],st:{n:clone(ST_NEW)}});
    const newAnim=(id,n)=>({id:id,n:n,k:'a',anim:'pulse',hov:false,use:['a'],st:{n:{op:1}}});
    const stColl=(()=>{try{return new Intl.Collator(undefined,{numeric:true,sensitivity:'base'});}catch(_){return null;}})();
    const stCmp=(a,b)=>{const x=String(a||''),y=String(b||'');return stColl?stColl.compare(x,y):x.toLowerCase()<y.toLowerCase()?-1:x.toLowerCase()>y.toLowerCase()?1:0;};
    const stSorted=L=>(L||styles()).filter(Boolean).slice().sort((a,b)=>stCmp(a.n||'(unnamed)',b.n||'(unnamed)')||a.id-b.id);
    const stGrp=x=>x&&typeof x.g==='string'?x.g.trim():'';
    const stGroups=L=>[...new Set(L.map(stGrp).filter(Boolean))].sort(stCmp);
    const SGR=()=>Array.isArray(S.sgr)?S.sgr:[];
    const plusOpt=t=>'<option value="" selected disabled hidden>'+t+'</option>';
    function lookOpts(off,nw,kd){
      off=stSorted(off);
      const o=x=>'<option value="'+x.id+'">'+esc(x.n||'(unnamed)')+'</option>',S0=kd==='a'?[]:off.filter(x=>!isAn(x)),A=kd==='s'?[]:off.filter(isAn);
      const P=plusOpt(kd==='a'?'+ motion':kd==='s'?'+ style':'+ look');
      nw=nw&&'<optgroup label="new">'+(kd==='a'?'':'<option value="+">new style</option>')+(kd==='s'?'':'<option value="+a">new motion</option>')+'</optgroup>';
      const og=(l,L)=>L.length?'<optgroup label="'+esc(l)+'">'+L.map(o).join('')+'</optgroup>':'';
      const S2=[];stGroups(S0).forEach(g=>S0.forEach(x=>{if(stGrp(x)===g)S2.push(x);}));S0.forEach(x=>{if(!stGrp(x))S2.push(x);});
      if(stGroups(S0).length)return P+stGroups(S0).map(g=>og(g,S0.filter(x=>stGrp(x)===g))).join('')+og('styles',S0.filter(x=>!stGrp(x)))+
        og('motions',A)+(nw||'');
      return P+(S2.length?'<optgroup label="styles">'+S2.map(o).join('')+'</optgroup>':'')+
        (A.length?'<optgroup label="motions">'+A.map(o).join('')+'</optgroup>':'')+(nw||'');
    }
    function stMake(v){
      if(v!=='+'&&v!=='+a')return +v;
      const id=stNewId();if(!Array.isArray(S.styles))S.styles=[];
      S.styles.push(v==='+a'?newAnim(id,stFreeName('Motion')):newStyle(id,stFreeName('Style')));
      return id;
    }
    const ST_FV='var(--primary-text-color, #1e2430)';
    const ST_PE=Object.assign({},ST_P,{fc:'#8792a4',fa:1,sw:0,sc:'#000000',sa:.6,fv:ST_FV});
    const ST_DEFL={dur:0,ease:'ease',anim:'',hov:false,st:{n:Object.assign({},ST_PE)}};
    const ST_DEFI=JSON.parse(JSON.stringify(ST_DEFL));
    const clone=o=>JSON.parse(JSON.stringify(o));
    const styles=()=>Array.isArray(S.styles)?S.styles:[];
    const DEFK={'0':ST_DEF,'-1':ST_DEFL,'-2':ST_DEFI};
    const BGS=()=>Array.isArray(S.bgs)?S.bgs:[];
    const bgOf=id=>BGS().find(b=>b&&b.id===id)||null;
    const isBgl=o=>!!o&&BGS().indexOf(o)>=0;
    const bglCls=b=>'sfondo-livello s-'+slug(b.id);
    function defOf(id){return DEFK[id];}
    const defSt=()=>defOf(0);
    function stById(id){return id>0?styles().find(x=>x&&x.id===id)||null:null;}
    const styIds=s=>Array.isArray(s&&s.sty)?s.sty:[];
    function stysOf(s){const a=styIds(s);return a.length?a.map(stById).filter((x,i,A)=>x&&A.indexOf(x)===i):[];}
    function setSty(q,id,on){
      const a=styIds(q).filter(v=>v!==id);if(on)a.push(id);
      if(a.length)q.sty=a;else delete q.sty;
    }
    const kindOf=s=>isCard(s)?'c':!isEl(s)?'z':s.t==='label'?'l':'i';
    const defId=k=>k==='z'?0:k==='l'?-1:-2;
    const decoIcon=s=>s.t==='icon'&&!!s.icon;
    const freeTxt=s=>String(s.txt||'').replace(/[\r\n]+/g,' ');
    const decoLabel=s=>s.t==='label'&&!!freeTxt(s).trim();
    const expEl=s=>isEl(s)&&(decoIcon(s)||decoLabel(s)||s.t==='label'&&!!folRule(s,'text'));
    function decoIds(){
      const m=new Map();
      S.objects.forEach(s=>{if(expEl(s))m.set(s,s.id);});
      return m;
    }
    function elDefUse(){
      const u={l:false,i:false};
      S.objects.forEach(x=>{if(expEl(x))u[kindOf(x)]=true;});
      return u;
    }
    function stState(st,k){const p=st&&st.st&&st.st[k];return p?Object.assign({},ST_P,p):null;}
    const TX_W={'300':'300','500':'500','600':'600',bold:'bold'};
    const TX_A={start:1,end:1};
    function txOf(st){
      const t=st&&st.tx&&typeof st.tx==='object'?st.tx:{},o={};
      const ff=txFont(t.ff);if(ff)o.ff=ff;
      if(+t.fs>0)o.fs=clamp(+t.fs,4,400);
      if(TX_W[t.fw])o.fw=t.fw;
      if(t.fi)o.fi=true;
      if(TX_A[t.ta])o.ta=t.ta;
      if(+t.ls)o.ls=clamp(+t.ls,-50,200);
      if(t.up)o.up=true;
      return o;
    }
    function txFont(v){return String(v||'').replace(/[;{}<>"\\\n\r]/g,'').replace(/\s+/g,' ').trim().slice(0,120);}
    const TX_GEN=/^(serif|sans-serif|monospace|system-ui|cursive|fantasy|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|inherit)$/i;
    function txFam(v){return v.split(',').map(x=>x.trim().replace(/^'|'$/g,'')).filter(Boolean).map(x=>TX_GEN.test(x)?x:'"'+x+'"').join(', ');}
    function txDecl(st){
      const t=txOf(st),d=[];
      if(t.ff)d.push('font-family: '+txFam(t.ff));
      if(t.fs)d.push('font-size: '+f(t.fs)+'px');
      if(t.fw)d.push('font-weight: '+t.fw);
      if(t.fi)d.push('font-style: italic');
      if(t.ta)d.push('text-anchor: '+t.ta);
      if(t.ls)d.push('letter-spacing: '+f(t.ls)+'px');
      if(t.up)d.push('text-transform: uppercase');
      return d;
    }
    function lblTx(s){return s.t!=='label'?{}:Object.assign({},txOf(defOf(-1)),...stysOf(s).map(txOf));}
    function stIds(){return mem('si',0,stIds0);}
    function stIds0(){
      const m=new Map(),used=new Set();
      styles().forEach(x=>{
        if(!x)return;
        const b='st-'+(gslug(x.n)||x.id);let n=b,k=2;
        while(used.has(n))n=b+'-'+(k++);
        used.add(n);m.set(x.id,n);
      });
      return m;
    }
    function stClass(s){const m=stIds();return stysOf(s).map(x=>m.get(x.id)).join(' ');}
    function zcls(s){const c=stClass(s);return 'zone'+(s.t==='line'?' linea':'')+(hasImg(s)?' zone-img':'')+(c?' '+c:'');}
    const phoCls=(s,i)=>{i=i||0;const I=phAll(s)[i]||NOI;return 'stato'+(I.follow?' segue':'')+' s-'+phSlug(s,i);};
    function ecls(s,id){const c=stClass(s);return (s.t==='label'?'etichetta e-':'icona i-')+slug(id||s.id)+(c?' '+c:'');}
    const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    function rgba(hex,a){
      const m=/^#?([0-9a-f]{6})$/i.exec(String(hex||''));const n=m?parseInt(m[1],16):0;
      return 'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+(+clamp(+a||0,0,1).toFixed(2))+')';
    }
    const imgId=gid=>String(gid).replace('grad-','img-');
    function fillV(p,gid,el,css){
      if(p.f==='n')return 'none';
      if(css&&(p.f==='k'||sprP(p))){const m=/grad-(.+)-n$/.exec(gid);if(m)return 'var(--pf-'+m[1]+', url(#'+gid+'))';}
      if(p.f==='c'||(p.f==='i'&&el))return rgba(p.fc,p.fa);
      if(p.f==='i'){
        const m=css&&imgCopyP(p)?/grad-(.+)-n$/.exec(gid):null;
        return (m?'var(--pf-'+m[1]+', url(#'+imgId(gid)+'))':'url(#'+imgId(gid)+')')+' '+rgba(p.fc,p.fa);
      }
      return 'url(#'+gid+')';
    }
    function stDecl(p,gid,fid,el,U){
      U=U||ST_SEC;const d=[];
      if(U.indexOf('f')>=0)d.push('fill: '+(p.fv&&p.f==='c'?p.fv:fillV(p,gid,el,true)));
      if(U.indexOf('b')<0){ }
      else if(p.sw>0){
        d.push('stroke: '+rgba(p.sc,p.sa),'stroke-width: '+f(p.sw));
        if(el)d.push('paint-order: stroke','stroke-linejoin: round');
        else d.push('stroke-dasharray: '+(p.sd==='d'?f(p.sw*4)+' '+f(p.sw*3):p.sd==='p'?'0 '+f(p.sw*2.5):'none'),
          'stroke-linecap: '+(p.sd==='p'?'round':'butt'));
      }else d.push('stroke: none');
      if(U.indexOf('o')>=0)d.push('opacity: '+(+clamp(p.op,0,1).toFixed(2)));
      if(U.indexOf('m')>=0)d.push('mix-blend-mode: '+bmOf(p));
      if(U.indexOf('g')>=0)d.push('filter: '+(p.g?'url(#'+fid+')':'none'));
      return d;
    }
    const PHO_SEC=['o','m','v','t'];
    const stPho=st=>stUseOf(st).some(k=>PHO_SEC.indexOf(k)>=0);
    const FD_K={vf:'f',vk:'k',va:'a0',va2:'a1',vg:'g',vm:'m',vt:'t'};
    function fdOf(p){
      p=p||{};const n=(v,d,a,b)=>v==null||v===''||isNaN(+v)?d:clamp(+v,a,b);
      return {f:p.vf==='n'||p.vf==='r'?p.vf:'l',k:p.vk==='t'?'t':'',a0:n(p.va,1,0,1),a1:n(p.va2,0,0,1),g:n(p.vg,90,-3600,3600),m:n(p.vm,50,0,100),t:n(p.vt,1,0,1)};
    }
    const isFd=x=>!!x&&stHas(x,'v')&&fdOf(stState(x,'n')).f!=='n';
    function fdStys(s){
      const L=[],add=x=>{if(isFd(x)&&L.indexOf(x)<0)L.push(x);};
      stysOf(s).forEach(add);
      RULS().forEach(r=>{if(!rHas(r,s))return;(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{if(x&&(x.k==='look'||x.k==='act')&&Array.isArray(x.sty))idsStys(x.sty).forEach(add);});});
      return L;
    }
    function fdGrad(p,id){
      const q=fdOf(p),c=q.m/100,st='<stop offset="'+f4(clamp(c-q.t/2,0,1))+'" stop-color="#fff" stop-opacity="'+f(q.a0)+'"/>'+
        '<stop offset="'+f4(clamp(c+q.t/2,0,1))+'" stop-color="#fff" stop-opacity="'+f(q.a1)+'"/>';
      if(q.f==='r')return '<radialGradient id="'+id+'" cx="0.5" cy="0.5" r="0.5">'+st+'</radialGradient>';
      const a=q.g*Math.PI/180,cx=Math.cos(a)/2,cy=Math.sin(a)/2;
      return '<linearGradient id="'+id+'" x1="'+f(.5-cx)+'" y1="'+f(.5-cy)+'" x2="'+f(.5+cx)+'" y2="'+f(.5+cy)+'">'+st+'</linearGradient>';
    }
    function fdMask(s,id,gid,cv){
      const b=cv?{x0:0,y0:0,x1:S.w,y1:S.h}:bboxOf([s]),a='x="'+f(b.x0)+'" y="'+f(b.y0)+'" width="'+f(b.x1-b.x0)+'" height="'+f(b.y1-b.y0)+'"';
      return '<mask id="'+id+'" maskUnits="userSpaceOnUse" '+a+'><rect '+a+' fill="url(#'+gid+')"/></mask>';
    }
    const fdMaskMv=(s,id,el,gid)=>'<mask id="'+id+'" maskUnits="userSpaceOnUse" x="'+(-S.w)+'" y="'+(-S.h)+'" width="'+(3*S.w)+'" height="'+(3*S.h)+'">'+
      tagOf(s,el+' fill="url(#'+gid+')"')+'</mask>';
    const fdMv=s=>tfClip(s)&&!agOf(s).length?fdStys(s).filter(st=>fdOf(stState(st,'n')).k!=='t'):[];
    const fdElId=(s,st)=>s.id+'.sfuma-'+stIds().get(st.id);
    function trOf(st,fo){
      const d=Math.max(0,+st.dur||0),e=st.ease||'ease';
      return d?['opacity'].concat(fo&&tfUsed()?TR_X:[]).map(k=>k+' '+d+'ms '+e).join(', '):'none';
    }
    function phoOf(L,fo){
      const o={};
      L.forEach(x=>{
        const U=stUseOf(x),p=stState(x,'n')||ST_P;
        if(U.indexOf('o')>=0)o.o=+clamp(p.op,0,1).toFixed(2);
        if(U.indexOf('m')>=0)o.m=bmOf(p);
        if(fo&&U.indexOf('x')>=0)o.x=p;
        if(U.indexOf('v')>=0)o.v=isFd(x)?x.id:'none';
        if(U.indexOf('t')>=0)o.t=trOf(x,fo);
      });
      return o;
    }
    const fdDecl=v=>'mask: var(--fd-'+(v==='none'?'none':stIds().get(v))+', none)';
    function phoDecl(st,fo){
      const P=phoOf([st],fo),d=[];
      if(P.o!=null)d.push('opacity: '+P.o);
      if(P.m)d.push('mix-blend-mode: '+P.m);
      if(P.v!=null)d.push(fdDecl(P.v));
      if(P.x)d.push(...tfDecl(P.x,'p'));
      if(P.t)d.push('transition: '+P.t);
      return d;
    }
    const FILL_PAT=['ps','pg','pd','pc'];
    const isPat=p=>!!p&&FILL_PAT.indexOf(p.f)>=0;
    const isGrad=p=>!!p&&(p.f==='l'||p.f==='r'||p.f==='k'||isPat(p));
    const ftOf=p=>p.ft==null||p.ft===''||isNaN(+p.ft)?1:clamp(+p.ft,0,1);
    const pzOf=p=>+p.pz>0?clamp(+p.pz,1,1000):20;
    const pwOf=p=>p.pw==null||p.pw===''||isNaN(+p.pw)?30:clamp(+p.pw,1,100);
    const ftW=(t,s)=>s<=0?(t<.5?0:1):clamp((t-(.5-s/2))/s,0,1);
    const f4=n=>+n.toFixed(4);
    function gradMix(p,w){
      const rgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));const n=m?parseInt(m[1],16):0;return[n>>16&255,n>>8&255,n&255];};
      const c0=rgb(p.fc),c1=rgb(p.fc2),a0=clamp(+p.fa||0,0,1),a1=clamp(+p.fa2||0,0,1);
      return 'rgba('+c0.map((x,i)=>Math.round(x+(c1[i]-x)*w)).join(',')+','+(+(a0+(a1-a0)*w).toFixed(2))+')';
    }
    function gradStops(p){
      const s=ftOf(p);
      return '<stop offset="'+f4(.5-s/2)+'" stop-color="'+esc(p.fc)+'" stop-opacity="'+(+clamp(p.fa,0,1).toFixed(2))+'"/>'+
        '<stop offset="'+f4(.5+s/2)+'" stop-color="'+esc(p.fc2)+'" stop-opacity="'+(+clamp(p.fa2,0,1).toFixed(2))+'"/>';
    }
    function gradTag(p,id,X){
      if(p.f==='k')return conicTag(p,id);
      if(isPat(p))return patTag(p,id,X);
      const st=gradStops(p);
      if(p.f==='l'){
        const a=(+p.fg||0)*Math.PI/180,cx=Math.cos(a)/2,cy=Math.sin(a)/2;
        return '<linearGradient id="'+id+'" x1="'+f(.5-cx)+'" y1="'+f(.5-cy)+'" x2="'+f(.5+cx)+'" y2="'+f(.5+cy)+'">'+st+'</linearGradient>';
      }
      return p.f==='r'?'<radialGradient id="'+id+'" cx="0.5" cy="0.5" r="0.5">'+st+'</radialGradient>':'';
    }
    const fpOf=p=>PIV.some(q=>q[0]===p.fp)?p.fp:'c';
    const fpU=p=>{const q=fpOf(p);return {x:q.indexOf('l')>=0?0:q.indexOf('r')>=0?1:.5,y:q[0]==='t'?0:q[0]==='b'?1:.5};};
    const fpR=(x,y,w,h)=>Math.max(Math.hypot(x,y),Math.hypot(w-x,y),Math.hypot(x,h-y),Math.hypot(w-x,h-y));
    const conW=id=>String(id).replace(/-n$/,'-w');
    function conicTag(p,id){
      const s=ftOf(p),a0=+p.fg||0,h0=90*(1-s),h1=90*(1+s),seg=[];
      const add=(a,b,w)=>{const c=gradMix(p,w),l=seg[seg.length-1];if(l&&l.c===c&&Math.abs(l.b-a)<1e-9)l.b=b;else seg.push({a:a,b:b,c:c});};
      const ramp=(a,b,dOf)=>{const n=Math.ceil(b-a-1e-9);for(let i=0;i<n;i++){const x=a+(b-a)*i/n,y=a+(b-a)*(i+1)/n;add(x,y,ftW(dOf((x+y)/2),s));}};
      if(h0>0)add(-h0,h0,0);
      ramp(h0,h1,m=>m/180);
      if(h1<180)add(h1,360-h1,1);
      ramp(360-h1,360-h0,m=>(360-m)/180);
      const P=a=>{const r=(a0+a)*Math.PI/180;return f4(1.04*Math.cos(r))+' '+f4(1.04*Math.sin(r));};
      const d=x=>{const n=Math.max(1,Math.ceil((x.b-x.a)/30)),q=[];for(let i=0;i<=n;i++)q.push(P(x.a+(x.b-x.a)*i/n));return 'M0 0L'+q.join('L')+'Z';};
      const u=fpU(p);
      return '<g id="'+conW(id)+'" shape-rendering="crispEdges">'+seg.map(x=>'<path fill="'+x.c+'" d="'+d(x)+'"/>').join('')+'</g>'+
        '<pattern id="'+id+'" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">'+
        '<g transform="translate('+u.x+' '+u.y+') scale('+f4(fpR(u.x,u.y,1,1))+')"><use href="#'+conW(id)+'"/></g></pattern>';
    }
    const pfId=(cls,s,pre,p)=>(pre||'')+(p&&p.f==='i'?'img-':'grad-')+cls+'-n-'+slug(s.id);
    function pfTag(p,cls,s,pre){
      if(p.f==='i')return pfImg(p,cls,s,pre);
      const id=pfId(cls,s,pre),A=pfArea(p,s),M=A&&isEl(s)?elInv(s):'',u=fpU(p);
      if(p.f!=='k'){
        const w=Math.max(1,A.x1-A.x0),h=Math.max(1,A.y1-A.y0),st=gradStops(p);
        if(p.f==='l'){
          const a=(+p.fg||0)*Math.PI/180,cx=Math.cos(a)/2,cy=Math.sin(a)/2;
          return '<linearGradient id="'+id+'" gradientUnits="userSpaceOnUse" x1="'+f4(A.x0+w*(.5-cx))+'" y1="'+f4(A.y0+h*(.5-cy))+'" x2="'+f4(A.x0+w*(.5+cx))+'" y2="'+f4(A.y0+h*(.5+cy))+'"'+
            (M?' gradientTransform="'+M+'"':'')+'>'+st+'</linearGradient>';
        }
        return '<radialGradient id="'+id+'" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="'+(M?M+' ':'')+
          'translate('+f4(A.x0+w/2)+' '+f4(A.y0+h/2)+') scale('+f4(w/2)+' '+f4(h/2)+')">'+st+'</radialGradient>';
      }
      const W=(pre||'')+'grad-'+cls+'-w',k=' id="'+id+'" class="pf pf-'+slug(s.id)+'"';
      const inner=(x,y,R)=>'<g transform="translate('+f4(x)+' '+f4(y)+')"><g class="fr"><g transform="scale('+f4(R)+')"><use href="#'+W+'"/></g></g></g>';
      if(isEl(s)&&!A)return '<pattern'+k+' patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">'+inner(u.x,u.y,fpR(u.x,u.y,1,1))+'</pattern>';
      const b=A||pfBox(s),w=Math.max(1,b.x1-b.x0),h=Math.max(1,b.y1-b.y0);
      return '<pattern'+k+' patternUnits="userSpaceOnUse" x="'+f4(b.x0)+'" y="'+f4(b.y0)+'" width="'+f4(w)+'" height="'+f4(h)+'"'+(M?' patternTransform="'+M+'"':'')+'>'+
        inner(u.x*w,u.y*h,fpR(u.x*w,u.y*h,w,h))+'</pattern>';
    }
    function pfImg(p,cls,s,pre){
      const u=esc((pre?vurl:full)(p.ip)),b=p.ia==='g'?imgArea(p,s):pfBox(s),id=pfId(cls,s,pre,p);
      if(p.ifit==='tile'){
        const w=f4(tileW(p)),h=f4(tileH(p));
        return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" x="'+f4(b.x0)+'" y="'+f4(b.y0)+'" width="'+w+'" height="'+h+'"><image href="'+u+'" x="0" y="0" width="'+w+'" height="'+h+'" preserveAspectRatio="none"/></pattern>';
      }
      const w=f4(Math.max(1,b.x1-b.x0)),h=f4(Math.max(1,b.y1-b.y0));
      return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" x="'+f4(b.x0)+'" y="'+f4(b.y0)+'" width="'+w+'" height="'+h+'"><image href="'+u+'" x="0" y="0" width="'+w+'" height="'+h+'" preserveAspectRatio="'+(PAR[p.ifit]||PAR.cover)+'"/></pattern>';
    }
    function imgArea(p,s){
      const C=chainOf(s);if(!C.length)return null;
      const b=grpBox(C[C.length-1]);return isFinite(b.x0)&&isFinite(b.x1)?b:null;
    }
    const imgCopyP=p=>!!p&&p.f==='i'&&!!p.ip&&(p.ia==='g'||p.ia!=='t'&&p.ifit==='tile');
    function pfBox(s){
      if(s.t==='callout'){const g=coInfo(s);if(g.tail==='line'&&!g.inside)return {x0:g.x,y0:g.y,x1:g.x+g.w,y1:g.y+g.h};}
      return bboxOf([s]);
    }
    function pfArea(p,s){
      if(p.fsp==='t'){const P=hasPgs()&&s.pg?pgOf(s.pg):null,A=P?pgA(P):{x:0,y:0,w:S.w,h:S.h};return {x0:A.x,y0:A.y,x1:A.x+A.w,y1:A.y+A.h};}
      if(p.fsp==='g'){const C=chainOf(s);if(C.length){const b=grpBox(C[C.length-1]);if(isFinite(b.x0)&&isFinite(b.x1))return b;}}
      return null;
    }
    const sprP=p=>!!p&&(p.f==='l'||p.f==='r'||p.f==='k')&&(p.fsp==='g'||p.fsp==='t');
    function elInv(s){
      const p0=posOf(s),R=elMat(s);
      let m=[R[0],R[1],R[2],R[3],p0.x-R[0]*p0.x-R[2]*p0.y,p0.y-R[1]*p0.x-R[3]*p0.y];
      if(s.t==='icon'){
        const sz=s.size||28,k=sz/24,t=[k,0,0,k,p0.x-sz/2,p0.y-sz/2];
        m=[m[0]*t[0]+m[2]*t[1],m[1]*t[0]+m[3]*t[1],m[0]*t[2]+m[2]*t[3],m[1]*t[2]+m[3]*t[3],m[0]*t[4]+m[2]*t[5]+m[4],m[1]*t[4]+m[3]*t[5]+m[5]];
      }
      const [a,b,c,d,e,g]=m,det=a*d-b*c;
      if(a===1&&b===0&&c===0&&d===1&&e===0&&g===0||!det)return '';
      return 'matrix('+[d/det,-b/det,-c/det,a/det,(c*g-d*e)/det,(b*e-a*g)/det].map(f4).join(' ')+')';
    }
    const isCon=x=>!!x&&!isAn(x)&&stHas(x,'f')&&(stState(x,'n')||{}).f==='k';
    const isSpr=x=>!!x&&!isAn(x)&&stHas(x,'f')&&sprP(stState(x,'n'));
    const isImgC=x=>!!x&&!isAn(x)&&stHas(x,'f')&&imgCopyP(stState(x,'n'));
    function pfStys(s){return mem('pf',s,()=>pfStys0(s));}
    function pfStys0(s){
      if(!s||isEl(s)&&!expEl(s)||isCard(s)||s.t==='line')return [];
      const need=x=>isCon(x)||isSpr(x)&&!!pfArea(stState(x,'n'),s)||isImgC(x)&&!isEl(s)&&(stState(x,'n').ia!=='g'||!!imgArea(stState(x,'n'),s));
      const L=stysOf(s).filter(need),T=[s.id].concat(chainOf(s)),add=x=>{if(need(x)&&L.indexOf(x)<0)L.push(x);};
      if(!mem('kc',0,()=>styles().some(x=>isCon(x)||isSpr(x)||isImgC(x))))return L;
      RULS().forEach(r=>{if(rKind(r)==='cond'&&rOn(r).some(id=>T.indexOf(id)>=0)&&rOk(r))idsStys(rSty(r)).forEach(add);});
      tapLys().forEach(q=>{const x=q.x;if((x.to||[]).some(id=>T.indexOf(id)>=0))idsStys(x.sty).forEach(add);});
      return L;
    }
    const pfCon=s=>pfStys(s).filter(isCon);
    const pfTags=(s,pre)=>{const ids=stIds();return pfStys(s).map(st=>pfTag(stState(st,'n'),ids.get(st.id),s,pre)).join('');};
    const pfVars=(s,pre)=>{const ids=stIds();return pfStys(s).map(st=>'--pf-'+ids.get(st.id)+': url(#'+pfId(ids.get(st.id),s,pre,stState(st,'n'))+')').join('; ');};
    function patTag(p,id,X){
      const z=pzOf(p)*((X&&X.ps)||1),w=z*pwOf(p)/100,T=p.f==='pc'?2*z:z,c=' fill="'+rgba(p.fc,p.fa)+'"',r=(+p.fg||0)%360;
      const bg=clamp(+p.fa2||0,0,1)>0?'<rect width="'+f4(T)+'" height="'+f4(T)+'" fill="'+rgba(p.fc2,p.fa2)+'"/>':'';
      const Z=f4(z),W=f4(w),fg=p.f==='ps'?'<rect width="'+W+'" height="'+Z+'"'+c+'/>':
        p.f==='pg'?'<path d="M0 0H'+Z+'V'+W+'H'+W+'V'+Z+'H0Z"'+c+'/>':
        p.f==='pd'?'<circle cx="'+f4(z/2)+'" cy="'+f4(z/2)+'" r="'+f4(w/2)+'"'+c+'/>':
        '<path d="M0 0H'+Z+'V'+Z+'H0ZM'+Z+' '+Z+'H'+f4(T)+'V'+f4(T)+'H'+Z+'Z"'+c+'/>';
      return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" x="0" y="0" width="'+f4(T)+'" height="'+f4(T)+'"'+
        (r?' patternTransform="rotate('+f4(r)+')"':'')+'>'+bg+fg+'</pattern>';
    }
    function fillOf(s){
      const L=stysOf(s).filter(x=>stHas(x,'f')),x=L.length?L[L.length-1]:null;
      return {st:x||defOf(defId(kindOf(s))),c:x?stIds().get(x.id):null};
    }
    function coGrads(s){
      if(!s||s.t!=='callout')return null;
      const g=coInfo(s);if(g.tail!=='line'||g.inside)return null;
      const F=fillOf(s),p=stState(F.st,'n');
      return isGrad(p)?{g:g,p:p,c:F.c}:null;
    }
    function gradAt(p,g,q){
      if(isPat(p))return rgba(p.fc,p.fa);
      const u=(q.x-g.x)/g.w,v=(q.y-g.y)/g.h,a=(+p.fg||0)*Math.PI/180;
      let t;
      if(p.f==='k'){const c=fpU(p),d=((Math.atan2((v-c.y)*g.h,(u-c.x)*g.w)-a)*180/Math.PI%360+360)%360;t=(d<=180?d:360-d)/180;}
      else t=clamp(p.f==='l'?(u-.5)*Math.cos(a)+(v-.5)*Math.sin(a)+.5:Math.hypot(u-.5,v-.5)/.5,0,1);
      return gradMix(p,ftW(t,ftOf(p)));
    }
    function coBodyD(g){
      if(g.ell){const A=' A'+f(g.rx)+','+f(g.ry)+' 0 0 1 ';
        return 'M'+f(g.cx+g.rx)+','+f(g.cy)+A+f(g.cx-g.rx)+','+f(g.cy)+A+f(g.cx+g.rx)+','+f(g.cy)+' Z';}
      const r=g.R,x=g.x,y=g.y,w=g.w,h=g.h,A=r?' A'+f(r)+','+f(r)+' 0 0 1 ':'';
      return r?'M'+f(x+r)+','+f(y)+' H'+f(x+w-r)+A+f(x+w)+','+f(y+r)+' V'+f(y+h-r)+A+f(x+w-r)+','+f(y+h)+
               ' H'+f(x+r)+A+f(x)+','+f(y+h-r)+' V'+f(y+r)+A+f(x+r)+','+f(y)+' Z'
             :'M'+f(x)+','+f(y)+' H'+f(x+w)+' V'+f(y+h)+' H'+f(x)+' Z';
    }
    function coArea(p,s,g){const A=sprP(p)?pfArea(p,s):null;return A?{x:A.x0,y:A.y0,w:Math.max(1,A.x1-A.x0),h:Math.max(1,A.y1-A.y0)}:g;}
    function coPat(s,o,id,gid){
      const g=o.g,m=Math.max(coDot(s),s.lw||3)+2;
      const x0=Math.floor(Math.min(g.x,g.tip.x-m)),y0=Math.floor(Math.min(g.y,g.tip.y-m));
      const x1=Math.ceil(Math.max(g.x+g.w,g.tip.x+m)),y1=Math.ceil(Math.max(g.y+g.h,g.tip.y+m)),bd=coBodyD(g);
      return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" x="'+x0+'" y="'+y0+'" width="'+(x1-x0)+'" height="'+(y1-y0)+'">'+
        '<g transform="translate('+(-x0)+','+(-y0)+')"><path fill-rule="evenodd" fill="'+gradAt(o.p,coArea(o.p,s,g),g.c)+'" d="'+coPath(s)+' '+bd+'"/>'+
        '<path fill="url(#'+gid+')" d="'+bd+'"/></g></pattern>';
    }
    function imgPat(p,id,X){
      if(!p.ip)return '';
      const u=esc(((X&&X.u)||full)(p.ip));
      if(p.ifit==='tile'){
        const k=(X&&X.ps)||1,w=f4(tileW(p)*k),h=f4(tileH(p)*k);
        return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" x="0" y="0" width="'+w+'" height="'+h+'"><image href="'+u+'" x="0" y="0" width="'+w+'" height="'+h+'" preserveAspectRatio="none"/></pattern>';
      }
      if(p.ia==='t'&&!(X&&X.sw))
        return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" x="0" y="0" width="'+S.w+'" height="'+S.h+'">'+
          '<image href="'+u+'" x="0" y="0" width="'+S.w+'" height="'+S.h+'" preserveAspectRatio="'+(PAR[p.ifit||S.bgFit]||'none')+'"/></pattern>';
      const w=+p.iw>0?Math.round(+p.iw):0,h=+p.ih>0?Math.round(+p.ih):0;
      if(!w||!h)return '<pattern id="'+id+'" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1">'+
        '<image href="'+u+'" x="0" y="0" width="1" height="1" preserveAspectRatio="none"/></pattern>';
      return '<pattern id="'+id+'" patternUnits="objectBoundingBox" x="0" y="0" width="1" height="1" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="'+(PAR[p.ifit]||PAR.cover)+'">'+
        '<image href="'+u+'" x="0" y="0" width="'+w+'" height="'+h+'"/></pattern>';
    }
    const tileW=p=>+p.isz>0?clamp(+p.isz,1,10000):+p.iw>0?Math.min(+p.iw,S.w):100;
    const tileH=p=>+p.iw>0&&+p.ih>0?tileW(p)*p.ih/p.iw:tileW(p);
    function stDefs(st,base,pre,X){
      const out=[],G=(pre||'')+'grad-'+base+'-',F=(pre||'')+'glow-'+base+'-';
      ['n'].forEach(k=>{
        const p=stState(st,k);if(!p)return;
        if(isGrad(p)&&stHas(st,'f'))out.push(gradTag(p,G+k,X));
        if(p.f==='i'&&stHas(st,'f')){const t=imgPat(p,imgId(G+k),X);if(t)out.push(t);}
        if(p.g&&stHas(st,'g'))out.push('<filter id="'+F+k+'" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">'+
          '<feGaussianBlur in="SourceAlpha" stdDeviation="'+f(Math.max(0,p.gb)/2)+'"/><feOffset dx="'+f(p.gx)+'" dy="'+f(p.gy)+'" result="o"/>'+
          '<feFlood flood-color="'+esc(p.gc)+'" flood-opacity="'+(+clamp(p.ga,0,1).toFixed(2))+'"/><feComposite in2="o" operator="in"/>'+
          '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>');
      });
      return out;
    }
    function stRules(st,Q){
      const rule=(sel,d)=>d.length?sel+'{\n  '+d.join(';\n  ')+';\n}\n':'';
      const U=stUseOf(st),n=stState(st,'n'),tx=Q.tx?txDecl(st):[];
      const dec=stDecl(n,Q.pre+'grad-'+Q.id+'-n',Q.pre+'glow-'+Q.id+'-n',Q.el,U);
      if(Q.edit)return rule(Q.base,dec.filter(x=>x.indexOf('mix-blend-mode')!==0).concat(tx));
      const dur=Math.max(0,+st.dur||0),ea=st.ease||'ease';
      const tr=U.indexOf('t')<0?[]:dur?['transition: '+trList().map(x=>x+' '+dur+'ms '+ea).join(', ')]
        :Array.isArray(st.use)?['transition: none']:[];
      const tf=U.indexOf('x')>=0&&!Q.noTf?tfDecl(n,Q.k):[];
      let c=rule(Q.base,dec.concat(Q.cur?['cursor: pointer']:[],tr,tf,tx));
      if(Q.h&&U.indexOf('f')>=0&&st.hov&&n.f==='c')c+=Q.h+'{ fill: '+rgba(n.fc,Math.min(1,(+n.fa||0)+.1))+'; }\n';
      const A=U.indexOf('a')>=0?anOf(st,n,Q.k,null,Q.noAn?'s':'ws'):null;
      if(A){
        const kf=(Q.kf||Q.pre+'anim-'+Q.id)+(Q.noAn?'-s':'');
        c+='@media (prefers-reduced-motion: no-preference){\n  '+Q.base+'{ animation: '+kf+' '+A.sh+';'+
           (A.tf?' transform-box: fill-box; transform-origin: '+A.og+';':'')+' }\n}\n'+
           '@keyframes '+kf+'{ '+A.kf+' }\n';
      }
      return c;
    }
    const AN={
      pulse:{l:'pulse',d:1.6,e:'ease-in-out',i:35,u:'min opacity',s:'%'},
      blink:{l:'blink',d:1,e:'steps(1,end)',i:35,u:'min opacity',s:'%'},
      fade:{l:'fade in',d:.6,e:'ease-out',r:1},
      color:{l:'color',d:1.6,e:'ease-in-out'},
      beat:{l:'heartbeat',d:1.2,e:'ease-in-out',i:15,u:'grow',s:'%',tf:1},
      spin:{l:'spin',d:2,e:'linear',tf:1},
      shake:{l:'shake',d:.5,e:'ease-in-out',i:5,u:'amplitude',s:'%',tf:1},
      bounce:{l:'bounce',d:1,e:'ease-in-out',i:15,u:'height',s:'%',tf:1},
      wiggle:{l:'wiggle',d:.8,e:'ease-in-out',i:10,u:'angle',s:'°',tf:1},
      custom:{l:'custom',d:1,e:'ease-in-out'}
    };
    const AN_K=['ad','ar','al','ai','ac','aa','ap','a0','a1','ae','ax','ay','pp','ps','pv'];
    const PROPS={
      op:{l:'opacity',u:'',a:0,b:1,d:1,st:.05,v0:1,v1:.3},
      mx:{l:'move x',u:'px',a:-10000,b:10000,d:0,st:1,v0:0,v1:20,tf:1},
      my:{l:'move y',u:'px',a:-10000,b:10000,d:0,st:1,v0:0,v1:20,tf:1},
      mr:{l:'rotate',u:'°',a:-3600,b:3600,d:0,st:1,v0:0,v1:360,tf:1},
      ms:{l:'scale',u:'%',a:0,b:1000,d:100,st:1,v0:100,v1:120,tf:1},
      fc:{l:'fill color',c:1,v0:'#4a90d9',v1:'#e8a33d'},
      fr:{l:'fill rotation',u:'°',a:-3600,b:3600,d:0,st:1,v0:0,v1:360},
      sw:{l:'border width',u:'px',a:0,b:200,d:0,st:.5,v0:0,v1:4},
      sc:{l:'border color',c:1,v0:'#5b6577',v1:'#e8a33d'},
      fs:{l:'text size',u:'px',a:1,b:400,d:16,st:1,v0:16,v1:24},
      ls:{l:'letter spacing',u:'px',a:-50,b:200,d:0,st:.5,v0:0,v1:4}
    };
    const TF_K=['mx','my','mr','ms'];
    const AN_E=['ease-in-out','linear','ease-in','ease-out'];
    const TR_X=['translate','rotate','scale'];
    const tfUsed=()=>styles().some(x=>x&&stHas(x,'x'));
    const trList=()=>['fill','stroke','stroke-width','opacity'].concat(tfUsed()?TR_X:[]);
    const tfNum=(p,k)=>{const P=PROPS[k],v=+(p&&p[k]);return isFinite(v)&&p[k]!==''&&p[k]!=null?clamp(v,P.a,P.b):P.d;};
    function tfTr(x,y,k){
      if(k!=='l'&&k!=='i'||!x&&!y)return f(x)+'px '+f(y)+'px';
      return 'calc(var(--ta, 1) * '+f(x)+'px + var(--tb, 0) * '+f(y)+'px) calc(var(--tc, 0) * '+f(x)+'px + var(--td, 1) * '+f(y)+'px)';
    }
    const tfRot=(r,k)=>(k==='l'||k==='i')&&r?'calc(var(--tr, 1) * '+f(r)+'deg)':f(r)+'deg';
    function tfDecl(p,k){
      const d=['translate: '+tfTr(tfNum(p,'mx'),tfNum(p,'my'),k),'rotate: '+tfRot(tfNum(p,'mr'),k),'scale: '+f(tfNum(p,'ms')/100)];
      if(k!=='p'&&k!=='g')d.push('transform-box: fill-box','transform-origin: center');
      return d;
    }
    const stX=st=>!!st&&stHas(st,'x');
    const anTf=st=>!!st&&stHas(st,'a')&&st.anim==='custom'&&moOf(st).pp.some(p=>TF_K.indexOf(p)>=0);
    const stTf=st=>stX(st)||anTf(st);
    function tfVars(s){
      const R=elMat(s),k=s.t==='icon'?(s.size||28)/24:1;
      if(k===1&&R[0]===1&&R[1]===0&&R[2]===0&&R[3]===1)return null;
      const q=v=>Math.round(v/k*1e4)/1e4;
      return '--ta: '+q(R[0])+'; --tb: '+q(R[1])+'; --tc: '+q(R[2])+'; --td: '+q(R[3])+(R[0]*R[3]-R[1]*R[2]<0?'; --tr: -1':'');
    }
    function anVal(st,k){
      const v=st&&st[k];if(v==null||v==='')return '';
      if(k==='ac')return v;
      return typeof v==='number'?String(f(v)):String(v);
    }
    const anNum=(v,a,b,d)=>{const x=typeof v==='number'?v:parseFloat(v);return isFinite(x)?clamp(x,a,b):d;};
    function anRep(v){
      if(v==null||v==='')return null;
      if(/^\s*(inf|infinite|∞)\s*$/i.test(String(v)))return 'infinite';
      const x=parseFloat(v);return isFinite(x)&&x>0?+x.toFixed(2):null;
    }
    function anOf(st,n,k,box,F){
      const T=AN[st&&st.anim];if(!T)return null;
      F=F||'ws';
      const d=anNum(st.ad,.05,600,T.d),dl=anNum(st.al,0,600,0),r=anRep(st.ar)||T.r||'infinite';
      const fin=r!=='infinite',fm=st.anim==='fade'?(fin?' both':' backwards'):fin?' forwards':'';
      if(st.anim==='custom'){
        const M=moOf(st),e=AN_E.indexOf(st.ae)>=0?st.ae:T.e,sc=x=>f(x/100);
        const has=p=>M.pp.indexOf(p)>=0&&(F==='o'?p==='op':F.indexOf(MO_FAM[p])>=0)&&!(k==='c'&&MO_NEW.indexOf(p)>=0);
        if(!M.pp.some(has))return null;
        const v=q=>[has('op')?'opacity: '+q.op:'',has('mx')||has('my')?'translate: '+tfTr(has('mx')?q.mx:0,has('my')?q.my:0,k):'',
          has('mr')?'rotate: '+tfRot(q.mr,k):'',has('fr')?'rotate: '+f(q.fr)+'deg':'',
          has('ms')?'scale: '+(st.ay==='x'?sc(q.ms)+' 1':st.ay==='y'?'1 '+sc(q.ms):sc(q.ms)):'',has('fc')?'fill: '+rgba(q.fc,q.fa):'',
          has('sc')?'stroke: '+rgba(q.sc,q.sa):'',has('sw')?'stroke-width: '+f(q.sw):'',
          has('fs')?'font-size: '+f(q.fs)+'px':'',has('ls')?'letter-spacing: '+f(q.ls)+'px':''].filter(Boolean).join('; ');
        return {sh:f(d)+'s '+e+(dl?' '+f(dl)+'s':'')+' '+r+(st.ax?' alternate':'')+fm,
          kf:M.ps.map(q=>(q.t===0?'from':q.t===100?'to':q.t+'%')+'{ '+v(q.v)+'; }').join(' '),tf:M.pp.some(p=>has(p)&&!!PROPS[p].tf),og:moOg(st)};
      }
      if(F==='o'||F.indexOf(st.anim==='color'?'s':'w')<0)return null;
      const i=T.i==null?0:anNum(st.ai,0,T.s==='°'?360:1000,T.i);
      let kf;
      if(st.anim==='pulse'||st.anim==='blink'){
        const o=+clamp(n.op,0,1).toFixed(2),lo=+(o*Math.min(i,100)/100).toFixed(2);
        kf='0%, 100%{ opacity: '+o+'; } 50%{ opacity: '+lo+'; }';
      }
      else if(st.anim==='fade')kf='from{ opacity: 0; }';
      else if(st.anim==='color')kf='50%{ fill: '+rgba(st.ac||'#e8a33d',st.aa==null?1:clamp(+st.aa||0,0,1))+'; }';
      else if(st.anim==='beat')kf='0%, 30%, 60%, 100%{ transform: none; } 15%{ transform: scale('+f(1+i/100)+'); } 45%{ transform: scale('+f(1+i*.6/100)+'); }';
      else if(st.anim==='spin')kf='to{ transform: rotate(360deg); }';
      else if(st.anim==='shake'){const a=box?f(i*box.w/100)+'px':f(i)+'%';kf='0%, 100%{ transform: none; } 20%, 60%{ transform: translateX(-'+a+'); } 40%, 80%{ transform: translateX('+a+'); }';}
      else if(st.anim==='bounce')kf='0%, 100%{ transform: none; } 50%{ transform: translateY(-'+(box?f(i*box.h/100)+'px':f(i)+'%')+'); }';
      else kf='0%, 100%{ transform: none; } 25%{ transform: rotate(-'+f(i)+'deg); } 75%{ transform: rotate('+f(i)+'deg); }';
      return {sh:f(d)+'s '+T.e+(dl?' '+f(dl)+'s':'')+' '+r+fm,kf:kf,tf:!!T.tf,og:'center'};
    }
    const anWhole=st=>!!st&&stHas(st,'a')&&!!AN[st.anim]&&st.anim!=='color'&&!(st.anim==='custom'&&!moFam(st,'w'));
    const anMv=st=>anWhole(st)&&(st.anim==='custom'?anTf(st):!!AN[st.anim].tf);
    const isFr=st=>!!st&&stHas(st,'a')&&st.anim==='custom'&&moFam(st,'r');
    const moOrg=(st,b)=>moPv(st)?' transform-origin: '+pivPx(moPv(st),b)+';':'';
    function anPiece(st,sel,cls,pid,b,F){
      const A=anOf(st,stState(st,'n'),'z',{w:b.x1-b.x0,h:b.y1-b.y0},F||'w');if(!A)return '';
      const kf='anim-'+cls+'-'+slug(pid);
      return '@media (prefers-reduced-motion: no-preference){\n  '+sel+'{ animation: '+kf+' '+A.sh+';'+moOrg(st,b)+' }\n}\n@keyframes '+kf+'{ '+A.kf+' }\n';
    }
    const fq=n=>Math.round(n*1e5)/1e5;
    function splitTop(v){const o=[];let d=0,b='';for(const ch of v.trim()){if(ch==='(')d++;else if(ch===')')d--;if(ch===' '&&!d){if(b)o.push(b);b='';}else b+=ch;}if(b)o.push(b);return o;}
    const ngv=v=>{const m=/^(-?[\d.]+)(px|deg|%)?$/.exec(v.trim());return m?fq(-m[1])+(m[2]||''):'calc(-1 * '+v.trim()+')';};
    const rcv=v=>{const m=/^-?[\d.]+$/.exec(v.trim());return m?String(+v?fq(1/+v):0):'calc(1 / '+v.trim()+')';};
    function invDecl(d){
      const j=d.indexOf(':'),p=d.slice(0,j).trim(),v=d.slice(j+1).trim();
      if(p==='translate')return 'transform: translate('+splitTop(v).map(ngv).join(', ')+')';
      if(p==='rotate')return 'rotate: '+ngv(v);
      if(p==='scale')return 'scale: '+splitTop(v).map(rcv).join(' ');
      if(p==='transition')return 'transition: '+v.replace(/(^|,\s*)translate(?=\s)/g,'$1transform');
      return d;
    }
    function kfInv(kf){
      return kf.replace(/\b(translate[XY]?|rotate|scale)\(([^()]*)\)/g,(m,fn,a)=>fn+'('+a.split(',').map(fn==='scale'?rcv:ngv).join(', ')+')')
        .replace(/(^|[{;]\s*)(translate|rotate|scale): ([^;]+);/g,(m,pre,p,v)=>pre+invDecl(p+': '+v)+';');
    }
    const MO_FAM={op:'w',mx:'w',my:'w',mr:'w',ms:'w',fc:'s',sw:'s',sc:'s',fs:'s',ls:'s',fr:'r'};
    const MO_A={fc:'fa',sc:'sa'};
    const MO_NEW=['sw','sc','fs','ls'];
    const moFam=(st,F)=>moOf(st).pp.some(p=>F.indexOf(MO_FAM[p])>=0);
    function moNum(P,v,d){
      if(P.c)return /^#[0-9a-f]{6}$/i.test(String(v||''))?v:d;
      const x=typeof v==='number'?v:parseFloat(v);return isFinite(x)?clamp(x,P.a,P.b):d;
    }
    function moOf(st){
      return mem('mo',st,()=>{
        let pp=(Array.isArray(st.pp)?st.pp:[]).filter((p,i,a)=>!!PROPS[p]&&a.indexOf(p)===i);
        if(!pp.length)pp=['op'];
        const raw=(Array.isArray(st.ps)?st.ps:[]).filter(isObj).map(q=>({t:Math.round(clamp(+q.t||0,0,100)),q:q}));
        raw.sort((a,b)=>a.t-b.t);
        const L=raw.filter((x,i)=>!i||x.t!==raw[i-1].t);
        if(!L.length||L[0].t!==0)L.unshift({t:0,q:{}});
        if(L[L.length-1].t!==100)L.push({t:100,q:{}});
        const ps=[];
        L.forEach((x,i)=>{
          const v={};
          pp.forEach(p=>{const P=PROPS[p],prev=i?ps[i-1].v[p]:P.v0;v[p]=moNum(P,x.q[p],i&&i===L.length-1&&L.length===2?P.v1:prev);});
          pp.forEach(p=>{const a=MO_A[p];if(a)v[a]=moNum({a:0,b:1},x.q[a],i?ps[i-1].v[a]:1);});
          ps.push({t:x.t,v:v});
        });
        return {pp:pp,ps:ps};
      });
    }
    const moPv=st=>st&&st.anim==='custom'&&PIV.some(q=>q[0]===st.pv)&&st.pv!=='c'?st.pv:'';
    const moOg=st=>moPv(st)?pivKw(moPv(st)):'center';
    function expQ(c,k){
      k=k||'z';
      if(k==='i'){const t=c?'.icona.'+c:'.icona';return {id:c||'icona',pre:'',el:true,k:k,kf:'anim-'+(c?c+'-i':'icona'),base:t};}
      const P=k==='l'?'etichetta':'zone',b=c?'.'+P+'.'+c:'.'+P;
      const q={id:c||P,pre:'',el:k==='l',tx:k==='l',k:k,kf:'anim-'+(c?c+(k==='l'?'-l':''):P),base:b};
      if(k==='z')Object.assign(q,{cur:true,h:b+':hover'});
      return q;
    }
    function edQ(c,edit,k){
      k=k||'z';
      const L={z:'zl',l:'zt',i:'zi'}[k],b='#cv .'+L+'.'+c;
      const q={id:c,pre:'ed-',edit:edit,el:k!=='z',tx:k==='l',k:k,noTf:true,kf:'ed-anim-'+c+'-'+k,base:b};
      if(k==='z')q.h='#cv.pv g:hover>.zl.'+c;
      return q;
    }
    function stEdit(id){return stById(id);}

    function fresh(){return{format:FORMAT,w:1280,h:800,grid:10,objects:[],groups:[],causes:[],rules:[],guides:[],bgFit:'fill',ver:0,sides:6};}
    const PAR={fill:'none',contain:'xMidYMid meet',cover:'xMidYMid slice'};
    const par=()=>PAR[S.bgFit]||'none';
    S=fresh();

    const NOI=Object.freeze({});
    const IM=s=>s&&s.img&&typeof s.img==='object'?s.img:NOI;
    function IMW(s){if(!s.img||typeof s.img!=='object')s.img={};return s.img;}
    const phAll=s=>!s||isEl(s)?[]:(isObj(s.img)?[s.img]:[]).concat(Array.isArray(s.imx)?s.imx.filter(isObj):[]);
    const phName=(s,I)=>(I&&typeof I.n==='string'&&I.n.trim())||'Photo '+(phAll(s).indexOf(I)+1);
    function phView(s,I){return !I||I===s.img?s:Object.assign(Object.create(s),{img:I});}
    const phZone=v=>v&&S.objects.indexOf(v)<0&&S.objects.indexOf(Object.getPrototypeOf(v))>=0?Object.getPrototypeOf(v):v;
    const phElId=(s,i)=>s.id+'.stato'+(i?'-'+(i+1):'');
    const phSlug=(s,i)=>slug(s.id)+(i?'-'+(i+1):'');
    function phSet(s,A){
      if(A.length)s.img=A[0];else delete s.img;
      if(A.length>1)s.imx=A.slice(1);else delete s.imx;
    }
    const phDef=s=>phAll(s).findIndex(I=>I.p);
    const phMulti=s=>phAll(s).filter(I=>I.p).length>1;
    const phOpen=s=>{const i=phCur.has(s.id)?phCur.get(s.id):-1;return i<phAll(s).length?i:-1;};
    function phIdx(s){const A=phAll(s),i=Math.max(0,phOpen(s));return A.length?Math.min(i,A.length-1):0;}
    const curPh=s=>phView(s,phAll(s)[phIdx(s)]);
    const hasImg=s=>phDef(s)>=0;
    const IFIT=[['cover','cover'],['contain','contain'],['fill','stretch']];
    const telaFit=s=>IM(s).tfit||S.bgFit||'fill';
    const boxKey=s=>IM(s).follow?'box':'tbox';
    function frameOf(s){
      let x,y,w,h;
      if(s.t==='rect'||s.t==='callout'||s.t==='card'){x=Math.min(s.x,s.x+s.w);y=Math.min(s.y,s.y+s.h);w=Math.abs(s.w);h=Math.abs(s.h);}
      else if(s.t==='circle'||s.t==='reg'||s.t==='ring'){const r=s.t==='ring'?s.r2:s.rr;x=s.cx-r;y=s.cy-r;w=h=2*r;}
      else{
        const p=s.p||[];x=Infinity;y=Infinity;let x1=-Infinity,y1=-Infinity;
        p.forEach(q=>{x=Math.min(x,q.x);y=Math.min(y,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y);});
        if(!p.length){x=y=0;x1=y1=1;}
        w=x1-x;h=y1-y;
      }
      return{x:x,y:y,w:Math.max(1,w||0),h:Math.max(1,h||0)};
    }
    const r4=v=>Math.round(v*10000)/10000;
    function ibox(s,key){
      const b=IM(s)[key||boxKey(s)];
      return Array.isArray(b)&&b.length===4&&b.every(v=>typeof v==='number'&&isFinite(v))&&b[2]>0&&b[3]>0?b:[.5,.5,1,1];
    }
    function imgRect(s){
      const I=IM(s),F=I.follow?frameOf(s):{x:0,y:0,w:S.w,h:S.h},b=ibox(s);
      const pa=I.follow?(PAR[I.fit]||PAR.cover):(PAR[telaFit(s)]||'none');
      return{x:F.x+(b[0]-b[2]/2)*F.w,y:F.y+(b[1]-b[3]/2)*F.h,w:b[2]*F.w,h:b[3]*F.h,par:pa};
    }
    const ibRef=s=>IM(s).follow?frameOf(s):{x:0,y:0,w:S.w,h:S.h};
    function boxFor(s,R){
      const F=frameOf(s);
      return[r4((R.x+R.w/2-F.x)/F.w),r4((R.y+R.h/2-F.y)/F.h),r4(R.w/F.w),r4(R.h/F.h)];
    }
    function setFollow(s,on){
      const I=IMW(s);if(!!I.follow===on)return;
      const R=imgRect(s),r6=v=>Math.round(v*1e6)/1e6;
      if(on){
        const F=frameOf(s);
        I.box=[r6((R.x+R.w/2-F.x)/F.w),r6((R.y+R.h/2-F.y)/F.h),r6(R.w/F.w),r6(R.h/F.h)];
        I.fit=telaFit(s);I.follow=true;return;
      }
      const fit=I.fit||'cover';
      delete I.follow;
      I.tbox=[r6((R.x+R.w/2)/S.w),r6((R.y+R.h/2)/S.h),r6(R.w/S.w),r6(R.h/S.h)];
      if(fit===(S.bgFit||'fill'))delete I.tfit;else I.tfit=fit;
    }
    const IMSZ={rect:1,callout:1,poly:1};
    function sizeToImg(s,w,h,ph){
      if(!IMSZ[s.t]||s.body==='line')return;
      const F=frameOf(s),cx=F.x+F.w/2,cy=F.y+F.h/2,x=iv(cx-w/2),y=iv(cy-h/2);
      const ax=v=>x+(v-F.x)*w/F.w,ay=v=>y+(v-F.y)*h/F.h;
      if(s.t==='poly')s.p=s.p.map(q=>Object.assign({},q,{x:iv(ax(q.x)),y:iv(ay(q.y))}));
      else{
        if(s.t==='callout'){
          const m=(v,a,L,n,N)=>v<a?n-(a-v):v>a+L?n+N+(v-a-L):n+(v-a)*N/L;
          s.px=iv(m(s.px,F.x,F.w,x,w));s.py=iv(m(s.py,F.y,F.h,y,h));
        }
        s.x=x;s.y=y;s.w=w;s.h=h;
      }
      if(ph){ph.follow=true;ph.box=[.5,.5,1,1];ph.fit='cover';}
    }
    function imgSrcs(s){
      const out=[],seen=new Set(),add=(p,l)=>{if(p&&!seen.has(p)){seen.add(p);out.push({p:p,l:l});}};
      phAll(s).forEach(I=>{if(I.p)add(I.p,'photo '+phName(s,I));});
      const L=stysOf(s);
      styles().forEach(x=>{
        if(!x||L.indexOf(x)<0||!stHas(x,'f'))return;
        const p=stState(x,'n');if(p.f==='i'&&p.ia!=='t')add(p.ip,'style '+(x.n||'(unnamed)'));
      });
      return out;
    }
    function fitShape(s){
      const I=IMW(s);
      if(I.follow){I.box=[.5,.5,1,1];I.fit='cover';}
      else{delete I.tbox;delete I.tfit;}
    }

    const isSel=s=>ms.indexOf(s)>=0;
    const locked=s=>!!(s&&(s.lk||chainOf(s).some(grpLk)));
    const LKC='M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z';
    const LKO='M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,17Z';
    const lkIcon=on=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(on?LKC:LKO)+'"/></svg>';
    let hidV=new Set(),hidFor=null;
    function hidS(){if(hidFor!==proj){hidFor=proj;hidV=new Set();}return hidV;}
    const hidOn=s=>!!(s&&(hidS().has(s.id)||chainOf(s).some(id=>hidS().has(id))));
    const vHid=s=>!pvl()&&hidOn(s);
    const EYO='M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z';
    const EYC='M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z';
    const unitG=s=>unitFor(s,false).ug!=null;
    function blockSel(){return new Set(fullG(ms));}
    function resel(){
      ms=ms.filter((s,i)=>S.objects.indexOf(s)>=0&&ms.indexOf(s)===i);
      if(selGrp!=null&&!isGrpSel(selGrp))selGrp=null;
      if(gIn!=null&&(!ms.length||!grpOf(gIn)||ms.some(q=>!inG(q,gIn))))gIn=null;
      if(selGrp!=null&&gIn!=null&&chainG(gIn).indexOf(selGrp)>=0)gIn=gpar(selGrp);
      sel=ms.length===1&&selGrp==null?S.objects.indexOf(ms[0]):-1;
    }
    function pick(list){ms=list.filter(Boolean);resel();}
    function pickG(list,g){ms=list.filter(Boolean);selGrp=g==null?null:g;resel();}
    function selOnly(i){pick(i>=0?[S.objects[i]]:[]);}

    function grpOf(id){
      if(id==null)return null;
      if(GM){let m=GM.gi;if(!m){m=GM.gi=new Map();(S.groups||[]).forEach(g=>{if(!m.has(g.id))m.set(g.id,g);});}return m.get(id)||null;}
      return (S.groups||[]).find(g=>g.id===id)||null;
    }
    function gpar(id){const G=grpOf(id);return G&&G.p!=null&&grpOf(G.p)?G.p:null;}
    function objOf(id){
      if(GM){let m=GM.oi;if(!m){m=GM.oi=new Map();S.objects.forEach(s=>{if(!m.has(s.id))m.set(s.id,s);});}return m.get(id);}
      return S.objects.find(q=>q.id===id);
    }
    function chainG(id){return mem('cg',id,()=>{const c=[];let k=id,G=k!=null?grpOf(k):null,n=0;while(G&&n++<64){c.push(k);const p=G.p,P=p!=null?grpOf(p):null;if(!P)break;k=p;G=P;}return c;});}
    function chainOf(s){return s&&s.g!=null?chainG(s.g):[];}
    function inG(s,id){return chainOf(s).indexOf(id)>=0;}
    function grpLk(id){const G=grpOf(id);return !!(G&&G.lk);}
    function depthG(id){return chainG(id).length-1;}
    function members(id){return mem('mb',id,()=>S.objects.filter(q=>inG(q,id)));}

    const PGS=()=>Array.isArray(S.pages)?S.pages:[];
    const hasPgs=()=>PGS().length>0;
    const pgOf=id=>PGS().find(p=>p&&p.id===id)||null;
    let curPg=null;
    function cpg(){const P=PGS();if(!P.length)return null;if(!pgOf(curPg))curPg=P[0].id;return curPg;}
    const pgName=p=>(p&&typeof p.n==='string'&&p.n.trim())||'Page';
    const comm=s=>hasPgs()&&!s.pg;
    let pgHold=false;
    const onPg=s=>!hasPgs()||!s.pg||!pgHold&&s.pg===cpg();
    const pgA=p=>{const a=p&&Array.isArray(p.a)?p.a:[];return{x:+a[0]||0,y:+a[1]||0,w:+a[2]||S.w,h:+a[3]||S.h};};
    const PG_AD=/^[a-z0-9][a-z0-9_-]{0,39}$/;
    const pgSlug=n=>String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^[-_]+|-+$/g,'').slice(0,40).replace(/-+$/,'');
    function pgAdFree(v,p){
      let b=PG_AD.test(v)?v:pgSlug(v)||p.id,a=b,k=2;
      while(PGS().some(q=>q!==p&&q.ad===a))a=b.slice(0,37)+'-'+k++;
      return a;
    }
    function pgfix(){
      if(S.pages!=null&&!Array.isArray(S.pages))delete S.pages;
      if(Array.isArray(S.pages)){
        const ids=new Set();
        S.pages=S.pages.filter(p=>p&&idNum('p',p.id)&&!ids.has(p.id)&&ids.add(p.id));
        S.pages.forEach(p=>{
          if(typeof p.n!=='string')p.n=pgName(p);
          const A=pgA(p),a=[Math.round(A.x),Math.round(A.y),Math.max(10,Math.round(A.w)),Math.max(10,Math.round(A.h))];
          if(!Array.isArray(p.a)||a.some((v,i)=>v!==p.a[i]))p.a=a;
        });
        S.pages.forEach((p,i)=>{if(i&&(p.a[2]!==S.pages[0].a[2]||p.a[3]!==S.pages[0].a[3]))p.a=[p.a[0],p.a[1],S.pages[0].a[2],S.pages[0].a[3]];});
        S.pages.forEach((p,i)=>{
          if(typeof p.ad!=='string'||!PG_AD.test(p.ad)||S.pages.some((q,j)=>j<i&&q.ad===p.ad))p.ad=pgAdFree(typeof p.ad==='string'&&p.ad?p.ad:p.n,p);
          if('tt' in p&&(PG_TT.indexOf(p.tt)<0||p.tt==='none'))delete p.tt;
          if('tdir' in p){const D=PG_DIR[pgTr(p).t];if(!D||!D.some(q=>q[0]===p.tdir))delete p.tdir;}
          if('tms' in p){const v=Math.round(+p.tms);if(!('tt' in p)||!(v>0))delete p.tms;else if(v!==p.tms)p.tms=clamp(v,50,5000);}
        });
        if(!S.pages.length)delete S.pages;
      }
      if(!hasPgs()){S.objects.forEach(q=>{if('pg' in q)delete q.pg;});return;}
      const first=S.pages[0].id;
      S.objects.forEach(q=>{if('pg' in q&&(typeof q.pg!=='string'||!pgOf(q.pg))){if(q.pg==null||q.pg==='')delete q.pg;else q.pg=first;}});
      const top=new Map();
      for(let i=S.objects.length-1;i>=0;i--){const q=S.objects[i],ch=chainOf(q),t=ch[ch.length-1];if(t!=null&&!top.has(t))top.set(t,q.pg||null);}
      S.objects.forEach(q=>{const ch=chainOf(q),t=ch[ch.length-1];if(t==null)return;const v=top.get(t);if(v){if(q.pg!==v)q.pg=v;}else if('pg' in q)delete q.pg;});
      const a=S.objects.filter(q=>q.pg),b=S.objects.filter(q=>!q.pg);
      if(a.length&&b.length&&S.objects.some((q,i)=>q!==(i<a.length?a[i]:b[i-a.length])))S.objects=a.concat(b);
    }
    function pgNew(){
      if(!hasPgs()){S.pages=[{id:'p1',n:'Page 1',a:[0,0,S.w,S.h]}];S.objects.forEach(q=>{q.pg='p1';});}
      const A=pgA(pgOf(cpg())),id=newId('p',S.pages);
      let k=S.pages.length+1;while(S.pages.some(p=>p.n==='Page '+k))k++;
      S.pages.push({id:id,n:'Page '+k,a:[A.x,A.y,A.w,A.h]});
      curPg=id;pick([]);selGrp=null;gIn=null;selBg=false;render();store(true);
    }
    function pgDel(){
      const P=PGS();if(P.length<2)return;
      const id=cpg(),n=S.objects.filter(q=>q.pg===id).length;
      if(n&&!confirm('Delete page “'+pgName(pgOf(id))+'” and its '+n+(n===1?' object':' objects')+'?'))return;
      S.objects=S.objects.filter(q=>q.pg!==id);
      const i=P.findIndex(p=>p.id===id);S.pages.splice(i,1);
      curPg=S.pages[Math.max(0,i-1)].id;pick([]);selGrp=null;gIn=null;selBg=false;render();store(true);
    }
    function pgGo(id){pgStop();if(!pgOf(id)||id===cpg())return;curPg=id;pick([]);selGrp=null;gIn=null;render();}
    function pgMove(list,id){
      const tops=new Set(list.map(q=>{const ch=chainOf(q);return ch[ch.length-1];}).filter(t=>t!=null));
      const all=S.objects.filter(q=>list.indexOf(q)>=0||tops.has(chainOf(q)[chainOf(q).length-1]));
      all.forEach(q=>{if(id)q.pg=id;else delete q.pg;});
      return all;
    }
    function isGrpSel(id){
      const m=members(id);
      return !!m.length&&m.length===ms.length&&m.every(isSel);
    }
    function unitFor(s,direct){
      const ch=chainOf(s);
      if(direct||!ch.length)return{unit:[s],ug:null,ctx:ch.length?ch[0]:null};
      let k=gIn!=null?ch.indexOf(gIn):-1;
      if(k<0)k=ch.length;
      const ctx=k<ch.length?ch[k]:null;
      if(k===0)return{unit:[s],ug:null,ctx:ctx};
      const ug=ch[k-1];
      return{unit:members(ug),ug:ug,ctx:ctx};
    }
    function fullG(list){
      const cx=new Set(gIn!=null?chainG(gIn):[]),L=new Set(list),full=new Set();
      (S.groups||[]).forEach(G=>{
        if(cx.has(G.id))return;
        const m=members(G.id);if(m.length&&m.every(q=>L.has(q)))full.add(G.id);
      });
      return [...full].filter(id=>{const p=gpar(id);return p==null||!full.has(p);});
    }
    function exactGrp(){
      const f=fullG(ms);
      return f.length===1&&isGrpSel(f[0])?f[0]:null;
    }
    function gNext(){return newId('g',S.groups);}
    function gName(){
      let k=(S.groups||[]).length+1;
      while((S.groups||[]).some(g=>g.n==='Group '+k))k++;
      return 'Group '+k;
    }
    function gfix(){
      if(!Array.isArray(S.groups))S.groups=[];
      const ids=new Set();
      S.groups=S.groups.filter(g=>g&&typeof g.id==='string'&&!ids.has(g.id)&&ids.add(g.id));
      const byId=new Map(S.groups.map(g=>[g.id,g]));
      S.groups.forEach(G=>{if(G.p!=null&&(!ids.has(G.p)||G.p===G.id))delete G.p;});
      S.groups.forEach(G=>{
        const seen=new Set([G.id]);let k=G.p;
        while(k!=null){if(seen.has(k)){delete G.p;break;}seen.add(k);const P=byId.get(k);k=P?P.p:null;}
      });
      S.objects.forEach(q=>{if(q.g!=null&&!ids.has(q.g))delete q.g;});
      const top=new Map();
      S.objects.forEach((q,i)=>chainOf(q).forEach(id=>top.set(id,i)));
      if(S.groups.some(g=>!top.has(g.id)))S.groups=S.groups.filter(g=>top.has(g.id));
      if(!top.size)return;
      const out=[];
      const emit=C=>{
        const it=[];
        S.objects.forEach((q,i)=>{if((q.g==null?null:q.g)===C)it.push({k:i,s:q});});
        S.groups.forEach(G=>{if((G.p==null?null:G.p)===C)it.push({k:top.get(G.id),g:G.id});});
        it.sort((a,b)=>a.k-b.k);
        it.forEach(x=>{if(x.s)out.push(x.s);else emit(x.g);});
      };
      emit(null);
      if(out.length===S.objects.length&&out.some((q,i)=>q!==S.objects[i]))S.objects=out;
    }
    function childKey(s,C){
      const ch=chainOf(s),k=C==null?ch.length:ch.indexOf(C);
      if(k<0)return undefined;
      return k===0?'s':ch[k-1];
    }
    function unitsIn(C){
      const u=[];
      S.objects.forEach(q=>{
        const key=childKey(q,C);if(key===undefined)return;
        const l=u[u.length-1];
        if(key!=='s'&&l&&l.key===key)l.list.push(q);else u.push({key:key,list:[q]});
      });
      return u;
    }
    function shiftUnit(first,d,C){
      const u=unitsIn(C),k=u.findIndex(x=>x.list.indexOf(first)>=0),j=k+d;
      if(k<0||j<0||j>=u.length)return false;
      const t=u[k];u[k]=u[j];u[j]=t;
      const flat=[].concat(...u.map(x=>x.list));
      const a=S.objects.findIndex(q=>childKey(q,C)!==undefined);
      S.objects.splice(a,flat.length,...flat);return true;
    }
    function nudge(s,d){return shiftUnit(s,d,s.g==null?null:s.g);}
    function lastIn(C){let k=-1;S.objects.forEach((q,i)=>{if(C==null||inG(q,C))k=i;});return k;}
    function selUnits(list){
      const fg=fullG(list);
      return{fg:fg,loose:list.filter(q=>!fg.some(id=>inG(q,id)))};
    }
    function commonG(cs){
      if(!cs.length||cs.some(c=>c==null))return null;
      const ch=chainG(cs[0]);
      return ch.find(id=>cs.every(c=>chainG(c).indexOf(id)>=0))||null;
    }
    function groupSel(){
      const mem=S.objects.filter(isSel);if(!mem.length)return;
      const u=selUnits(mem),n=u.fg.length+u.loose.length;
      if(n<2&&!(n===1&&u.fg.length===1))return;
      const C=commonG(u.fg.map(gpar).concat(u.loose.map(q=>q.g==null?null:q.g)));
      settle();
      const id=gNext(),G={id:id,n:gName()};
      if(C!=null)G.p=C;
      S.groups.push(G);
      u.fg.forEach(x=>{grpOf(x).p=id;});
      u.loose.forEach(q=>{q.g=id;});
      gfix();
      fold().delete(id);foldSave();
      gIn=C;pickG(mem,id);render();store(true);
    }
    function ungroup(ids){
      if(!ids.length)return;
      settle();
      const up=ids.map(gpar);
      ids.forEach(id=>{
        const P=gpar(id);
        S.objects.forEach(q=>{if(q.g===id){if(P==null)delete q.g;else q.g=P;}});
        S.groups.forEach(G=>{if(G.p===id){if(P==null)delete G.p;else G.p=P;}});
        S.groups=S.groups.filter(g=>g.id!==id);
        fold().delete(id);
      });
      foldSave();selGrp=null;gIn=up.every(x=>x===up[0])?up[0]:null;render();store(true);
    }
    let folded=new Set(),foldFor=null;
    const fkey=()=>KEY+'-gfold'+(proj?':'+proj:'');
    function fold(){
      if(foldFor!==proj){
        foldFor=proj;folded=new Set();
        try{const a=JSON.parse(localStorage.getItem(fkey())||'[]');if(Array.isArray(a))a.forEach(x=>{if(typeof x==='string')folded.add(x);});}catch(_){}
      }
      return folded;
    }
    function foldSave(){
      const f=fold();[...f].forEach(id=>{if(!grpOf(id)&&!(id.slice(0,2)==='S:'&&SGR().indexOf(id.slice(2))>=0))f.delete(id);});
      try{if(f.size)localStorage.setItem(fkey(),JSON.stringify([...f]));else localStorage.removeItem(fkey());}catch(_){}
    }
    function unfold(id){if(fold().delete(id))foldSave();}
    function unfoldTo(id){let ch=false;chainG(id).forEach(x=>{if(fold().delete(x))ch=true;});if(ch)foldSave();}
    const gslug=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()
      .replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');
    function groupIds(){
      const m=new Map();
      (S.groups||[]).forEach(g=>m.set(g.id,g.id));
      return m;
    }
    function movers(list){return list.filter(s=>!locked(s));}
    function anchorsEx(set){
      const a=[];
      S.objects.forEach(s=>{if(set.indexOf(s)<0&&onPg(s)&&!vHid(s))a.push(...snapPts(s));});
      return a;
    }

    const ID_RE={o:/^o[1-9][0-9]*$/,g:/^g[1-9][0-9]*$/,c:/^c[1-9][0-9]*$/,r:/^r[1-9][0-9]*$/,b:/^b[1-9][0-9]*$/,p:/^p[1-9][0-9]*$/};
    const idNum=(k,id)=>typeof id==='string'&&ID_RE[k].test(id)?+id.slice(1):0;
    const CKIND={cond:1,data:1,tap:1};
    function newId(k,list){
      let m=0;(list||[]).forEach(x=>{const n=x?idNum(k,x.id):0;if(n>m)m=n;});
      return k+(m+1);
    }
    const KIND_N={z:'Zone',l:'Label',i:'Icon',c:'Card'};
    const AUTO_N=/^(Zone|Label|Icon|Line) [0-9]+$/;
    function newName(s){
      const ln=s.t==='line',b=ln?'Line':KIND_N[kindOf(s)],L=S.objects.filter(q=>q!==s),used=new Set(L.map(q=>q.n));
      let k=L.filter(q=>ln?q.t==='line':kindOf(q)===kindOf(s)&&q.t!=='line').length+1;
      while(used.has(b+' '+k))k++;
      return b+' '+k;
    }
    function copyName(s){
      if(!s.n||AUTO_N.test(s.n))return newName(s);
      const used=new Set(S.objects.filter(q=>q!==s).map(q=>q.n)),b=s.n+' copy';
      let n=b,k=2;while(used.has(n))n=b+' '+(k++);
      return n;
    }
    function fixIds(k,list,remap){
      const seen=new Set(),bad=[];
      list.forEach(x=>{if(idNum(k,x.id)&&!seen.has(x.id))seen.add(x.id);else bad.push(x);});
      if(!bad.length)return false;
      let m=0;seen.forEach(id=>{m=Math.max(m,idNum(k,id));});
      bad.forEach(x=>{
        const o=x.id,n=k+(++m);
        if(remap&&o!=null&&!seen.has(o)&&!remap.has(o))remap.set(o,n);
        x.id=n;seen.add(n);
      });
      return true;
    }
    const ZTYPES={poly:1,line:1,reg:1,rect:1,circle:1,ring:1,callout:1,label:1,icon:1,card:1};
    const okPt=q=>isObj(q)&&isFinite(q.x)&&isFinite(q.y);
    const okObj=s=>isObj(s)&&ZTYPES[s.t]&&(s.t!=='poly'&&s.t!=='line'||Array.isArray(s.p)&&s.p.length>=2&&s.p.every(okPt));
    const V1_KEYS=['imgPath','imgFollow','imgBox','imgFit','imgTBox','imgTFit','eo','blend','dur','ease',
      'bind','pv','attr','dec','pre','suf','iconOn','ev','evp','col','colOn','font','align','anchor'];
    const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
    const IMG_OLD=['o','blend','dur','ease'];
    function fix2(){
      if(S.format!==FORMAT)S.format=FORMAT;
      if('need' in S&&!(Number.isInteger(S.need)&&S.need>0&&S.need<=LEVEL))delete S.need;
      if('pub' in S&&!(Number.isInteger(S.pub)&&S.pub>=0))delete S.pub;
      ['shapes','events','base','pv','sdef','sdefL','sdefI'].forEach(k=>{if(k in S)delete S[k];});
      if(!Array.isArray(S.objects))S.objects=[];
      if(!S.objects.every(okObj))S.objects=S.objects.filter(okObj);
      if(!Array.isArray(S.guides))S.guides=[];
      if(S.guides.some(g=>!isObj(g)))S.guides=S.guides.filter(isObj);
      if(!Array.isArray(S.groups))S.groups=[];
      if(S.groups.some(g=>!isObj(g)))S.groups=S.groups.filter(isObj);
      fixIds('o',S.objects);
      const gm=new Map();
      if(fixIds('g',S.groups,gm)&&gm.size){
        S.objects.forEach(s=>{if(s.g!=null&&typeof s.g!=='string'&&gm.has(s.g))s.g=gm.get(s.g);});
        S.groups.forEach(G=>{if(G.p!=null&&typeof G.p!=='string'&&gm.has(G.p))G.p=gm.get(G.p);});
      }
      S.groups.forEach(G=>{if(typeof G.n!=='string')G.n=gName();if('ev' in G)delete G.ev;});
      S.objects.forEach(s=>{
        if(isCard(s))cdFix(s);
        V1_KEYS.forEach(k=>{if(k in s)delete s[k];});
        if('cls' in s)delete s.cls;
        if('thru' in s&&(s.thru!==true||kindOf(s)!=='z'))delete s.thru;
        if(s.t==='line')lnFix(s);
        if(s.t==='poly'||s.t==='line')s.p.forEach(q=>{if('k' in q){if(typeof q.k!=='number'||!isFinite(q.k))delete q.k;else if(q.k<0||q.k>1)q.k=clamp(q.k,0,1);}});
        if('img' in s&&(isEl(s)||!isObj(s.img)))delete s.img;
        if('imx' in s){
          if(isEl(s)||!Array.isArray(s.imx))delete s.imx;
          else{if(s.imx.some(I=>!isObj(I)))s.imx=s.imx.filter(isObj);if(!s.imx.length)delete s.imx;else if(!isObj(s.img))s.img={};}
        }
        phAll(s).forEach(I=>{IMG_OLD.forEach(k=>{if(k in I)delete I[k];});if('n' in I&&(typeof I.n!=='string'||!I.n.trim()))delete I.n;});
        if(s.imx){
          const A=phAll(s),N=A.map(I=>I.n).filter(Boolean);
          A.forEach((I,i)=>{if(I.n)return;let k=i+1;if(N.indexOf('Photo '+k)>=0){k=1;while(N.indexOf('Photo '+k)>=0)k++;}I.n='Photo '+k;N.push(I.n);});
        }
        if(isObj(s.img)&&!Object.keys(s.img).length&&!s.imx)delete s.img;
        if(typeof s.n!=='string'||!s.n.trim())s.n=newName(s);
      });
      if('causes' in S){
        if(!Array.isArray(S.causes))S.causes=[];
        if(S.causes.some(c=>!isObj(c)||c.k!=null&&!CKIND[c.k]))S.causes=S.causes.filter(c=>isObj(c)&&(c.k==null||CKIND[c.k]));
        fixIds('c',S.causes);
        S.causes.forEach(k=>{
          if(k.k==null)k.k='cond';
          if(k.k==='tap'){['e','a','op','v','v2'].forEach(q=>{if(q in k)delete k[q];});if('g' in k&&TAP_G.indexOf(k.g)<0)delete k.g;return;}
          if(typeof k.e!=='string')k.e=k.e==null?'':String(k.e);
          if(k.e&&!ENT_OK.test(k.e))k.e='';
          if('a' in k&&(typeof k.a!=='string'||!k.a))delete k.a;
          if(k.k==='data')['op','v','v2'].forEach(q=>{if(q in k)delete k[q];});
          if(k.k==='cond'&&!EV_OPS.some(o=>o[0]===k.op))k.op='=';
        });
        TAP_G.forEach(g=>{
          const T=S.causes.filter(k=>k.k==='tap'&&tapG(k)===g);
          if(T.length<2)return;
          const one=T[0].id,gone=new Set(T.slice(1).map(k=>k.id));
          S.causes=S.causes.filter(k=>!gone.has(k.id));
          if(Array.isArray(S.rules))S.rules.forEach(r=>{if(isObj(r)&&Array.isArray(r.c)&&r.c.some(id=>gone.has(id)))r.c=r.c.map(id=>gone.has(id)?one:id);});
        });
      }
      if('bgPath' in S||'bgo' in S){
        const p=typeof S.bgPath==='string'?S.bgPath.trim():'';
        if(p){
          if(!Array.isArray(S.bgs))S.bgs=[];
          const b={id:newId('b',S.bgs.filter(isObj)),n:'Background',p:p},o=op01(S.bgo);
          if(o<1){
            const id=stNewId();if(!Array.isArray(S.styles))S.styles=[];
            S.styles.push({id:id,n:styles().some(x=>x&&x.n==='Background opacity')?stFreeName('Background opacity'):'Background opacity',dur:300,ease:'ease',anim:'',hov:false,use:['o'],st:{n:Object.assign(clone(ST_NEW),{op:o})}});
            b.sty=[id];
          }
          S.bgs.unshift(b);
        }
        delete S.bgPath;delete S.bgo;
      }
      if('bgs' in S){
        if(!Array.isArray(S.bgs))S.bgs=[];
        if(S.bgs.some(b=>!isObj(b)))S.bgs=S.bgs.filter(isObj);
        fixIds('b',S.bgs);
        S.bgs.forEach((b,i)=>{
          if(typeof b.p!=='string')b.p=b.p==null?'':String(b.p);
          if(typeof b.n!=='string'||!b.n.trim())b.n='Layer '+(i+1);
          if('sty' in b&&!Array.isArray(b.sty))delete b.sty;
        });
        if(!S.bgs.length)delete S.bgs;
      }
      if('sim' in S){
        if(!isObj(S.sim))delete S.sim;
        else Object.keys(S.sim).forEach(e=>{
          const x=S.sim[e];
          if(!isObj(x)){delete S.sim[e];return;}
          if('s' in x&&(x.s==null||typeof x.s==='object'))delete x.s;
          if('a' in x&&(!isObj(x.a)||!Object.keys(x.a).length))delete x.a;
          if(!('s' in x)&&!('a' in x))delete S.sim[e];
        });
      }
      if('clk' in S){
        if(!isObj(S.clk)||typeof S.clk.t!=='number'||!isFinite(S.clk.t))delete S.clk;
        else if(!isObj(S.clk.w))S.clk.w={};
      }
      if('ph' in S){
        if(!Array.isArray(S.ph))S.ph=[];
        const seen=new Set();
        if(S.ph.some(x=>!isObj(x)||!SP_RE.test(x.e)||seen.has(x.e)||!seen.add(x.e))){seen.clear();S.ph=S.ph.filter(x=>isObj(x)&&SP_RE.test(x.e)&&!seen.has(x.e)&&!!seen.add(x.e));}
        S.ph.forEach(x=>{
          if(typeof x.d!=='string'||!SP_DOM.test(x.d))x.d='sensor';
          if('n' in x&&(typeof x.n!=='string'||!x.n.trim()))delete x.n;
          if(typeof x.s!=='string')x.s=x.s==null||typeof x.s==='object'?'':String(x.s);
          if('a' in x&&(!isObj(x.a)||!Object.keys(x.a).length))delete x.a;
          if('m' in x&&CK_M.indexOf(x.m)<0)delete x.m;
        });
        if(!S.ph.length)delete S.ph;
      }
    }
    function lnFix(s){
      ['img','imx','r'].forEach(k=>{if(k in s)delete s[k];});
      [0,1].forEach(j=>{
        if('e'+j in s&&!lnEnd(s,j))delete s['e'+j];
        if('h'+j in s&&!lnHol(s,j))delete s['h'+j];
      });
      const num=(k,a,b,pos)=>{if(!(k in s))return;const v=lnNum(s[k]);if(v==null||pos&&!(v>0))delete s[k];else{const c=clamp(v,a,b);if(s[k]!==c)s[k]=c;}};
      num('es',1,20,true);num('dd',.5,20,true);num('dg',2,2000,true);num('fv',-10000,10000);num('gp',0,100);
      if(s.fv===0)delete s.fv;
      if(s.gp===100)delete s.gp;
    }
    const fmtOf=q=>!isObj(q)?0:q.format==null?1:q.format===FORMAT&&Number.isInteger(q.need)&&q.need>LEVEL?FORMAT+1:q.format;
    const pOpens=p=>p.format===FORMAT&&!(Number.isInteger(p.need)&&p.need>LEVEL);

    const dkey=n=>(n===undefined?proj:n)?KEY+':'+(n===undefined?proj:n):KEY;
    function bozza(n){try{const r=localStorage.getItem(dkey(n));const p=r&&JSON.parse(r);
      return fmtOf(p)===FORMAT&&Array.isArray(p.objects)?p:null;}catch(_){return null;}}
    const rkey=n=>KEY+'-rif:'+n;
    function rifOf(n){try{return localStorage.getItem(rkey(n))||'';}catch(_){return '';}}
    const norm=o=>JSON.stringify(Object.assign(fresh(),o));
    function hsh(t){let a=0x811c9dc5;for(let i=0;i<t.length;i++){a^=t.charCodeAt(i);a=Math.imul(a,16777619);}
      return (a>>>0).toString(36)+'.'+t.length;}
    function write(){
      if(opening){stamp();return;}
      try{
        localStorage.setItem(dkey(),JSON.stringify(S));
        if(proj){if(rifH)localStorage.setItem(rkey(proj),rifH);else localStorage.removeItem(rkey(proj));}
        saveErr=null;savedAt=new Date();
      }
      catch(e){const w=saveErr;saveErr=e&&e.name==='QuotaExceededError'?'storage full':'storage not writable';if(saveErr!==w)errShow('Draft not saved in this browser: '+saveErr);}
      stamp();pdRefresh();
    }
    function errShow(msg){
      const d=root.getElementById('erd'),t=root.getElementById('erdt');
      if(!d.hidden){if(t.textContent.split('\n').indexOf(msg)<0)t.textContent+='\n'+msg;return;}
      t.textContent=msg;d.hidden=false;root.getElementById('erdok').focus();
    }
    function errClose(){const d=root.getElementById('erd');if(d.hidden)return false;d.hidden=true;return true;}
    function stamp(msg,bad){
      const el=E.st;
      if(msg&&bad)errShow(msg);
      if(msg){el.textContent=el.title=msg;el.style.color=bad?'var(--error-color,#c33)':'var(--accent)';return;}
      if(saveErr){el.textContent=el.title='⚠ '+saveErr;el.style.color='var(--error-color,#c33)';return;}
      el.style.color='';el.textContent=el.title=savedAt?'draft '+savedAt.toLocaleTimeString(LOC()):'';
    }
    function store(now){clearTimeout(stT);stT=setTimeout(write,150);clearTimeout(snT);snT=0;
      if(now)snap();else snT=setTimeout(()=>{snT=0;snap();},600);}
    function settle(){if(snT){clearTimeout(snT);snT=0;snap();}}
    function flush(){clearTimeout(stT);write();}

    function snap(force){
      const j=JSON.stringify(S);
      if(!force&&hist[hi]===j)return;
      hist=hist.slice(0,hi+1);hist.push(j);
      if(hist.length>80)hist.shift();
      hi=hist.length-1;marks();
    }
    function marks(){
      uB.style.opacity=hi>0?1:.35;
      rB.style.opacity=hi<hist.length-1?1:.35;
    }
    function step(d){
      settle();
      const n=hi+d;if(n<0||n>=hist.length)return;
      hi=n;S=Object.assign(fresh(),JSON.parse(hist[hi]));pick([]);selG=-1;draft=null;
      fields();render();write();marks();
    }
    const RATIOS=[['16:9',16/9],['16:10',16/10],['3:2',3/2],['4:3',4/3],['21:9',21/9],['1:1',1],
                  ['9:16',9/16],['10:16',10/16],['2:3',2/3],['3:4',3/4]];
    function ratioOptions(){
      const cur=S.w/S.h;
      const hit=RATIOS.find(r=>Math.abs(r[1]-cur)<0.005);
      return '<option value="">'+(hit?'':(Math.round(cur*100)/100)+' ')+'custom</option>'+
        RATIOS.map(r=>'<option value="'+r[1]+'"'+(hit&&hit[0]===r[0]?' selected':'')+'>'+r[0]+'</option>').join('')+
        '<option value="bg">as background</option>';
    }
    function fields(){
      $('#cw').value=S.w;$('#ch').value=S.h;$('#gs').value=S.grid;
      $('#bgfit').value=S.bgFit||'fill';
      E.ratio.innerHTML=ratioOptions();
    }

    const probes=new Map(),dims=new Map();
    function full(p){
      if(!p)return '';
      if(/^(https?:|data:|\/)/.test(p))return p;
      return projDir().replace(/\/+$/,'')+'/'+p.replace(/^\/+/,'');
    }
    const bust=new Map();
    function vurl(p){
      const u=full(p),b=u&&bust.get(u);
      return b?u+(u.indexOf('?')<0?'?':'&')+'e='+b:u;
    }
    function used(p){return BGS().some(b=>b.p===p)||S.objects.some(s=>phAll(s).some(I=>I.p===p))||stImgs().some(x=>x.ip===p);}
    function stImgs(){
      return styles().map(x=>x&&x.st&&x.st.n).filter(p=>p&&p.f==='i'&&p.ip);
    }
    function stImgFix(){
      stImgs().forEach(p=>{
        const d=dims.get(full(p.ip));
        if(d&&d.w&&d.h){if(p.iw!==d.w)p.iw=d.w;if(p.ih!==d.h)p.ih=d.h;}
        else if(!probes.has(p.ip))probe(p.ip);
      });
    }
    function probe(p){
      if(!p||probes.has(p))return;
      probes.set(p,'...');
      setTimeout(()=>{
        if(!used(p)){probes.delete(p);return;}
        const u=full(p),im=new Image();
        const done=v=>{if(full(p)!==u)return;probes.set(p,v);insRefresh();blPanel();if(stImgs().some(x=>x.ip===p))render();};
        im.onload=()=>{dims.set(u,{w:im.naturalWidth,h:im.naturalHeight});done('ok');};
        im.onerror=()=>done('no');im.src=vurl(p);
      },350);
    }
    function pLabel(p,empty){
      if(!p)return empty;
      const st=probes.get(p);
      if(st===undefined){probe(p);return 'checking…';}
      return st==='ok'?'found: '+full(p):st==='no'?'not reachable: '+full(p):'checking…';
    }

    function roundPoly(p,r){
      const n=p.length;if(n<2)return'';
      if(!r)return'M'+p.map(q=>f(q.x)+','+f(q.y)).join(' L')+' Z';
      let d='';
      for(let i=0;i<n;i++){
        const c=p[i],a=p[(i-1+n)%n],b=p[(i+1)%n];
        const la=Math.hypot(a.x-c.x,a.y-c.y)||1,lb=Math.hypot(b.x-c.x,b.y-c.y)||1;
        const rr=Math.min(r,la/2,lb/2);
        const s={x:c.x+(a.x-c.x)/la*rr,y:c.y+(a.y-c.y)/la*rr};
        const e={x:c.x+(b.x-c.x)/lb*rr,y:c.y+(b.y-c.y)/lb*rr};
        d+=(i?' L':'M')+f(s.x)+','+f(s.y)+' Q'+f(c.x)+','+f(c.y)+' '+f(e.x)+','+f(e.y);
      }
      return d+' Z';
    }
    const crK=(q,t)=>q.s?0:(typeof q.k==='number'?q.k:(+t||0))/6;
    const crOn=(p,t)=>(+t||0)>0||p.some(q=>!q.s&&q.k>0);
    function crSegs(p,t,closed){
      const n=p.length,P=closed?i=>p[(i+n)%n]:i=>p[Math.max(0,Math.min(n-1,i))],out=[];
      for(let i=0;i<(closed?n:n-1);i++){
        const p0=P(i-1),p1=p[i],p2=P(i+1),p3=P(i+2),k1=crK(p1,t),k2=crK(p2,t);
        if(!(k1>0)&&!(k2>0)){out.push({a:p1,c1:p1,c2:p2,b:p2,l:1});continue;}
        out.push({a:p1,c1:{x:p1.x+(p2.x-p0.x)*k1,y:p1.y+(p2.y-p0.y)*k1},c2:{x:p2.x-(p3.x-p1.x)*k2,y:p2.y-(p3.y-p1.y)*k2},b:p2});
      }
      return out;
    }
    function splinePath(p,t){
      const n=p.length;if(n<3)return roundPoly(p,0);
      const P=q=>f(q.x)+','+f(q.y);
      return 'M'+P(p[0])+crSegs(p,t,true).map(g=>g.l?' L'+P(g.b):' C'+P(g.c1)+' '+P(g.c2)+' '+P(g.b)).join('')+' Z';
    }
    function regular(cx,cy,r,n,rot){
      const out=[];
      for(let i=0;i<n;i++){const a=rot+i*2*Math.PI/n;out.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});}
      return out;
    }
    function ringPath(s){
      const a0=s.a0,a1=a0+Math.max(0,Math.min(359.9,s.a1-a0));
      const R=a=>a*Math.PI/180,P=(r,a)=>({x:s.cx+r*Math.cos(R(a)),y:s.cy+r*Math.sin(R(a))});
      const big=a1-a0>180?1:0,o0=P(s.r2,a0),o1=P(s.r2,a1);
      if(s.r1<=0)return 'M'+f(s.cx)+','+f(s.cy)+' L'+f(o0.x)+','+f(o0.y)+' A'+f(s.r2)+','+f(s.r2)+' 0 '+big+' 1 '+f(o1.x)+','+f(o1.y)+' Z';
      const i1=P(s.r1,a1),i0=P(s.r1,a0);
      return 'M'+f(o0.x)+','+f(o0.y)+' A'+f(s.r2)+','+f(s.r2)+' 0 '+big+' 1 '+f(o1.x)+','+f(o1.y)+
             ' L'+f(i1.x)+','+f(i1.y)+' A'+f(s.r1)+','+f(s.r1)+' 0 '+big+' 0 '+f(i0.x)+','+f(i0.y)+' Z';
    }
    const CTAIL={wedge:1,curved:1,line:1,bubbles:1},CO_IN='Tip inside the body: no tail. Drag the tip out.';
    function coInfo(s){
      let x=Math.min(s.x,s.x+s.w),y=Math.min(s.y,s.y+s.h),w=Math.abs(s.w)||1,h=Math.abs(s.h)||1;
      const ln=s.body==='line',ell=s.body==='ellipse',tail=CTAIL[s.tail]?s.tail:'wedge';
      if(ln){
        const t=Math.max(.5,+s.lw||3);
        if(s.lo==='v'){x=x+Math.abs(s.w)/2-t/2;w=t;}else{y=y+Math.abs(s.h)/2-t/2;h=t;}
      }
      const cx=x+w/2,cy=y+h/2,rx=w/2,ry=h/2;
      const tip={x:s.px==null?cx:+s.px,y:s.py==null?y+h*1.6:+s.py};
      const nx=(tip.x-cx)/rx,ny=(tip.y-cy)/ry;
      const inside=ell?nx*nx+ny*ny<=1:Math.abs(nx)<=1&&Math.abs(ny)<=1;
      const side=Math.abs(nx)>Math.abs(ny)?(nx>0?1:3):(ny>0?2:0);
      const ax=ln&&tail==='line'&&!inside,hz=ax?s.lo!=='v':side===0||side===2;
      const R=ell||ln?0:Math.max(0,Math.min(s.r||0,w/2,h/2)),len=hz?w:h;
      let want=tail==='bubbles'?0:Math.max(.5,tail==='line'?(s.lw||3):(s.tw||0));
      const tb=Math.max(0,Math.min(1,s.tb==null?.5:+s.tb));
      let lo,hi,rc=R,tw,u;
      const base=()=>{
        rc=R;
        if(ax){
          const hw=Math.max(.5,+s.lw||3)/2,a=(hz?x:y)+hw,b=(hz?x+w:y+h)-hw;
          lo=Math.min(a,b);hi=Math.max(a,b);if(a>b)lo=hi=(a+b)/2;tw=0;u=lo+tb*(hi-lo);return;
        }
        if(ell){const k=Math.SQRT1_2*(hz?rx:ry);lo=(hz?cx:cy)-k;hi=(hz?cx:cy)+k;}
        else{
          rc=Math.max(0,Math.min(R,(len-Math.min(want,len))/2));
          lo=(hz?x:y)+rc;hi=(hz?x+w:y+h)-rc;
        }
        tw=Math.min(want,hi-lo);u=lo+tw/2+tb*(hi-lo-tw);
      };
      base();
      if(tail==='line'&&!inside&&!ax){
        const lw=want;
        for(let i=0;i<2;i++){
          const ax=hz?u:(side===3?x:x+w),ay=hz?(side===0?y:y+h):u,L=Math.hypot(tip.x-ax,tip.y-ay);
          if(!L)break;
          const sn=Math.abs(hz?tip.y-ay:tip.x-ax)/L;
          want=lw/Math.max(.25,sn);base();
        }
      }
      const at=v=>{
        if(!ell)return hz?{x:v,y:side===0?y:y+h}:{x:side===3?x:x+w,y:v};
        const d=hz?(v-cx)/rx:(v-cy)/ry,o=Math.sqrt(Math.max(0,1-d*d))*(side===0||side===3?-1:1);
        return hz?{x:v,y:cy+o*ry}:{x:cx+o*rx,y:v};
      };
      const c=ax?(hz?{x:u,y:cy}:{x:cx,y:u}):at(u),e0=ax?c:at(u-tw/2),e1=ax?c:at(u+tw/2);
      const p1=side<2?e0:e1,p2=side<2?e1:e0;
      return{x:x,y:y,w:w,h:h,cx:cx,cy:cy,rx:rx,ry:ry,ell:ell,ln:ln,ax:ax,tail:tail,tip:tip,inside:inside,side:side,hz:hz,
             R:R,rc:rc,lo:lo,hi:hi,tw:tw,u:u,c:c,e0:e0,e1:e1,p1:p1,p2:p2};
    }
    function coBend(g,s){
      const b=Math.max(-.5,Math.min(.5,+s.bend||0));
      return{x:-(g.tip.y-g.c.y)*b,y:(g.tip.x-g.c.x)*b};
    }
    const coDotAuto=s=>Math.max(3,(s.lw||3)*1.5);
    const coDot=s=>typeof s.dot==='number'&&isFinite(s.dot)?Math.max(0,Math.min(100,s.dot/2)):coDotAuto(s);
    function coBubbles(g,s){
      const dx=g.tip.x-g.c.x,dy=g.tip.y-g.c.y,L=Math.hypot(dx,dy),r0=Math.min(Math.max(1,(s.tw||0)/2),L*.14);
      return[[.22,1],[.58,.66],[.9,.42]].map(v=>({x:g.c.x+dx*v[0],y:g.c.y+dy*v[0],r:r0*v[1]}));
    }
    function coPath(s){
      const g=coInfo(s),P=q=>f(q.x)+','+f(q.y);
      const L=Math.hypot(g.tip.x-g.c.x,g.tip.y-g.c.y),dr=coDot(s);
      if(g.ax&&L>0){
        const hw=Math.max(.5,+s.lw||3)/2,ux=(g.tip.x-g.c.x)/L,uy=(g.tip.y-g.c.y)/L,nx=-uy,ny=ux;
        const at=(o,k,m)=>({x:o.x+ux*k+nx*hw*m,y:o.y+uy*k+ny*hw*m});
        let d='M'+f(g.x)+','+f(g.y)+' H'+f(g.x+g.w)+' V'+f(g.y+g.h)+' H'+f(g.x)+' Z M'+P(at(g.c,0,-1));
        if(dr>hw*1.05&&L>dr*2){const k=-Math.sqrt(dr*dr-hw*hw);d+=' L'+P(at(g.tip,k,-1))+' A'+f(dr)+','+f(dr)+' 0 1 1 '+P(at(g.tip,k,1));}
        else d+=' L'+P(at(g.tip,0,-1))+' L'+P(at(g.tip,0,1));
        return d+' L'+P(at(g.c,0,1))+' A'+f(hw)+','+f(hw)+' 0 0 1 '+P(at(g.c,0,-1))+' Z';
      }
      const open=!g.inside&&g.tail!=='bubbles';
      const dot=open&&g.tail==='line'&&dr>0&&L>dr*2;
      let d;
      if(g.ell){
        const A=' A'+f(g.rx)+','+f(g.ry)+' 0 ';
        d=open?'M'+P(g.p2)+A+'1 1 '+P(g.p1)
              :'M'+f(g.cx+g.rx)+','+f(g.cy)+A+'0 1 '+f(g.cx-g.rx)+','+f(g.cy)+A+'0 1 '+f(g.cx+g.rx)+','+f(g.cy);
      }else{
        const C=[{x:g.x,y:g.y},{x:g.x+g.w,y:g.y},{x:g.x+g.w,y:g.y+g.h},{x:g.x,y:g.y+g.h}];
        const D=[{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}];
        const k=open?g.side:0,rc=j=>open&&(j===k||j===(k+1)%4)?g.rc:g.R;
        const endOf=i=>{const j=(i+1)%4;return{x:C[j].x-D[i].x*rc(j),y:C[j].y-D[i].y*rc(j)};};
        const startOf=i=>({x:C[i].x+D[i].x*rc(i),y:C[i].y+D[i].y*rc(i)});
        d='M'+P(open?g.p2:startOf(0));
        for(let n=0;n<4;n++){
          const i=(k+n)%4,j=(i+1)%4,r=rc(j);
          d+=' L'+P(endOf(i));
          if(r>0)d+=' A'+f(r)+','+f(r)+' 0 0 1 '+P(startOf(j));
        }
        if(open)d+=' L'+P(g.p1);
      }
      if(!open){
        d+=' Z';
        if(!g.inside&&g.tail==='bubbles')coBubbles(g,s).forEach(b=>{
          const A=' A'+f(b.r)+','+f(b.r)+' 0 0 1 ';
          d+=' M'+f(b.x+b.r)+','+f(b.y)+A+f(b.x-b.r)+','+f(b.y)+A+f(b.x+b.r)+','+f(b.y)+' Z';
        });
        return d;
      }
      if(g.tail==='curved'){
        const o=coBend(g,s);
        d+=' Q'+f((g.p1.x+g.tip.x)/2+o.x)+','+f((g.p1.y+g.tip.y)/2+o.y)+' '+P(g.tip)+
           ' Q'+f((g.tip.x+g.p2.x)/2+o.x)+','+f((g.tip.y+g.p2.y)/2+o.y)+' '+P(g.p2);
      }else if(dot){
        const ux=(g.tip.x-g.c.x)/L,uy=(g.tip.y-g.c.y)/L,hw=Math.min(Math.max(.5,s.lw||3)/2,dr*.9),k=Math.sqrt(dr*dr-hw*hw);
        const sg=((g.p1.x-g.c.x)*-uy+(g.p1.y-g.c.y)*ux)>=0?1:-1;
        const q=m=>({x:g.tip.x-ux*k-uy*hw*m,y:g.tip.y-uy*k+ux*hw*m});
        d+=' L'+P(q(sg))+' A'+f(dr)+','+f(dr)+' 0 1 1 '+P(q(-sg));
      }else if(open&&g.tail==='line'&&L>0){
        const ux=(g.tip.x-g.c.x)/L,uy=(g.tip.y-g.c.y)/L,hw=Math.max(.5,s.lw||3)/2;
        const sg=((g.p1.x-g.c.x)*-uy+(g.p1.y-g.c.y)*ux)>=0?1:-1,q=m=>({x:g.tip.x-uy*hw*m,y:g.tip.y+ux*hw*m});
        d+=' L'+P(q(sg))+' L'+P(q(-sg));
      }else d+=' L'+P(g.tip);
      return d+' Z';
    }
    const isLn=s=>!!s&&s.t==='line';
    const LN_END={r:'round',a:'arrow',v:'open arrow',c:'circle',q:'square',d:'diamond',b:'bar'};
    const LN_HOL={a:1,c:1,q:1,d:1};
    const lnEnd=(s,j)=>{const v=s['e'+j];return typeof v==='string'&&LN_END[v]?v:'';};
    const lnHol=(s,j)=>s['h'+j]===true&&!!LN_HOL[lnEnd(s,j)];
    const lnNum=v=>v!==''&&v!=null&&isFinite(+v)?+v:null;
    const lnEs=s=>{const v=lnNum(s.es);return v>0?clamp(v,1,20):4;};
    const lnDd=s=>{const v=lnNum(s.dd);return v>0?clamp(v,.5,20):0;};
    const lnDg=s=>{const v=lnNum(s.dg);return v>0?clamp(v,2,2000):40;};
    const lnFv=s=>{const v=lnNum(s.fv);return v==null?0:clamp(v,-10000,10000);};
    const lnGp=s=>{const v=lnNum(s.gp);return v==null?null:clamp(v,0,100);};
    function lnSt(s){
      const L=stysOf(s).filter(x=>!isAn(x)&&stHas(x,'b')),x=L[L.length-1],p=x?stState(x,'n'):null;
      const sw=p?(+p.sw>0?+p.sw:0):2;
      return {w:sw>0?sw:2,sd:p&&sw>0?p.sd||'':''};
    }
    function lnPer(s){
      const per=(sd,w)=>sd==='d'?w*7:sd==='p'?w*2.5:0,b=lnSt(s);
      let P=per(b.sd,b.w);if(P)return P;
      const T=[s.id].concat(chainOf(s)),ok=x=>!isAn(x)&&stHas(x,'b')&&(stState(x,'n').sw>0)&&per(stState(x,'n').sd,1);
      RULS().forEach(r=>{if(P||rKind(r)!=='cond'||!rOn(r).some(id=>T.indexOf(id)>=0))return;
        const x=idsStys(rSty(r)).filter(ok).slice(-1)[0];if(x){const q=stState(x,'n');P=per(q.sd,+q.sw);}});
      return P;
    }
    const lnSegs=(p,t)=>crSegs(p,t,false);
    const bzAt=(g,t)=>{const u=1-t;return {x:u*u*u*g.a.x+3*u*u*t*g.c1.x+3*u*t*t*g.c2.x+t*t*t*g.b.x,y:u*u*u*g.a.y+3*u*u*t*g.c1.y+3*u*t*t*g.c2.y+t*t*t*g.b.y};};
    function bzCut(g,t){
      const L=(a,b)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
      const a1=L(g.a,g.c1),b1=L(g.c1,g.c2),c1=L(g.c2,g.b),a2=L(a1,b1),b2=L(b1,c1),m=L(a2,b2);
      return [{a:g.a,c1:a1,c2:a2,b:m,l:g.l},{a:m,c1:b2,c2:c1,b:g.b,l:g.l}];
    }
    function lnPathD(G){
      if(!G.length)return '';
      const P=q=>f(q.x)+','+f(q.y);
      return 'M'+P(G[0].a)+G.map(g=>g.l?' L'+P(g.b):' C'+P(g.c1)+' '+P(g.c2)+' '+P(g.b)).join('');
    }
    function lnLen(G){let L=0;G.forEach(g=>{let q=g.a;for(let i=1;i<=24;i++){const r=g.l?{x:g.a.x+(g.b.x-g.a.x)*i/24,y:g.a.y+(g.b.y-g.a.y)*i/24}:bzAt(g,i/24);L+=Math.hypot(r.x-q.x,r.y-q.y);q=r;}});return L;}
    const lnUnit=(x,y)=>{const L=Math.hypot(x,y);return L>1e-9?{x:x/L,y:y/L}:null;};
    function lnDir(G,j){
      const g=j?G[G.length-1]:G[0],e=j?g.b:g.a,c=j?g.c2:g.c1,o=j?g.a:g.b;
      return lnUnit(e.x-c.x,e.y-c.y)||lnUnit(e.x-o.x,e.y-o.y)||{x:j?1:-1,y:0};
    }
    function lnTrim(G,j,d){
      if(!(d>0)||!G.length)return G;
      const i=j?G.length-1:0,g=G[i],e=j?g.b:g.a,dist=t=>{const q=bzAt(g,t);return Math.hypot(q.x-e.x,q.y-e.y);};
      if(Math.hypot(g.b.x-g.a.x,g.b.y-g.a.y)<=d)return G;
      let lo=0,hi=1;
      for(let k=0;k<40;k++){const m=(lo+hi)/2;if(j?dist(m)>d:dist(m)<d)lo=m;else hi=m;}
      const t=(lo+hi)/2,c=bzCut(g,t),H=G.slice();H[i]=j?c[0]:c[1];return H;
    }
    function lnCap(G,j,s,w){
      const k=lnEnd(s,j);if(!k)return null;
      const g=j?G[G.length-1]:G[0],P=j?g.b:g.a,u=lnDir(G,j),n={x:-u.y,y:u.x},L=lnEs(s)*w,ho=lnHol(s,j);
      const at=(a,b)=>({x:P.x+u.x*a+n.x*b,y:P.y+u.y*a+n.y*b}),Q=q=>f(q.x)+','+f(q.y);
      const poly=(A,cl)=>'M'+A.map(Q).join(' L')+(cl?' Z':'');
      const solid=(A,I,r)=>({d:poly(A.map(q=>({x:I.x+(q.x-I.x)/2,y:I.y+(q.y-I.y)/2})),true),w:r,j:'miter'});
      const hol=(A,I,r)=>{const m=Math.max(.05,(r-w/2)/r);return {d:poly(A.map(q=>({x:I.x+(q.x-I.x)*m,y:I.y+(q.y-I.y)*m})),true),w:w,j:'miter'};};
      let o;
      if(k==='r'){const r=w/4,A=' A'+f(r)+','+f(r)+' 0 0 0 ';o={d:'M'+Q(at(0,r))+A+Q(at(r,0))+A+Q(at(0,-r)),w:w/2,cap:'butt',cut:0,b:[at(0,w/2),at(w/2,0),at(0,-w/2)]};}
      else if(k==='a'){
        const T=at(0,0),B1=at(-L,L*.45),B2=at(-L,-L*.45),a=Math.hypot(B1.x-B2.x,B1.y-B2.y),bl=Math.hypot(T.x-B1.x,T.y-B1.y),pe=a+2*bl;
        const I={x:(a*T.x+bl*B1.x+bl*B2.x)/pe,y:(a*T.y+bl*B1.y+bl*B2.y)/pe},r=L*L*.45/(pe/2);
        o=Object.assign(ho?hol([T,B1,B2],I,r):solid([T,B1,B2],I,r),{cut:L-(ho?0:Math.min(w/2,L/4)),b:[T,B1,B2]});
      }
      else if(k==='v'){const T=at(-w/2,0);o={d:poly([at(-L-w/2,L*.45),T,at(-L-w/2,-L*.45)]),w:w,j:'round',cap:'round',cut:w/2,b:[at(0,0),at(-L-w,L*.45+w/2),at(-L-w,-L*.45-w/2)]};}
      else if(k==='c'){
        const R=L/2,cy=f(P.y),r=ho?Math.max(.05,R-w/2):R/2,A=' A'+f(r)+','+f(r)+' 0 1 1 ';
        o={d:'M'+f(P.x+r)+','+cy+A+f(P.x-r)+','+cy+A+f(P.x+r)+','+cy+' Z',w:ho?w:R,cut:R,b:[at(R,R),at(-R,-R),at(R,-R),at(-R,R)]};
      }
      else if(k==='q'||k==='d'){
        const h=L/2,A=k==='q'?[at(h,h),at(h,-h),at(-h,-h),at(-h,h)]:[at(h,0),at(0,h),at(-h,0),at(0,-h)],r=k==='q'?h:h/Math.SQRT2;
        o=Object.assign(ho?hol(A,P,r):solid(A,P,r),{cut:h,b:A});
      }
      else o={d:poly([at(0,L/2),at(0,-L/2)]),w:w,cap:'butt',cut:w/2,b:[at(w/2,L/2),at(-w/2,-L/2),at(w/2,-L/2),at(-w/2,L/2)]};
      return o;
    }
    function lnGeo(s){
      return mem('lg',s,()=>{
        const p=Array.isArray(s.p)?s.p:[],w=lnSt(s).w,G0=p.length>=2?lnSegs(p,s.tens):[];
        if(!G0.length)return {G0:G0,G:G0,c:[null,null],w:w};
        const c=[lnCap(G0,0,s,w),lnCap(G0,1,s,w)];
        let G=lnTrim(G0,0,c[0]?c[0].cut:0);G=lnTrim(G,1,c[1]?c[1].cut:0);
        return {G0:G0,G:G,c:c,w:w};
      });
    }
    function lnInner(s,o){
      o=o||{};
      const g=lnGeo(s);if(!g.G.length)return '';
      const d=lnPathD(g.G),d0=lnPathD(g.G0),dd=lnDd(s),ga=o.ga!==undefined?o.ga:lnGp(s);
      let h=o.ed?'':'<path class="lh" d="'+d0+'" fill="none" stroke="transparent" stroke-width="'+f(Math.max(14,g.w+10))+'" stroke-linecap="round"/>';
      let mk='';
      if(ga!=null||o.pl){
        const id=(o.ed?'ed-':'')+'gm-'+slug(s.id),b=bx(),m=Math.max(g.w,dd*g.w)+4;bxLine(b,s);
        h+='<mask id="'+id+'" maskUnits="userSpaceOnUse" x="'+f(b.x0-m)+'" y="'+f(b.y0-m)+'" width="'+f(b.x1-b.x0+2*m)+'" height="'+f(b.y1-b.y0+2*m)+'">'+
          '<path class="lg" d="'+d+'" fill="none" stroke="#fff" stroke-width="'+f(2*m)+'" stroke-linecap="butt" pathLength="100"'+(ga!=null?' stroke-dasharray="'+f(ga)+' 100"':'')+'/>'+
          (()=>{const q=g.G[0].a,u=lnDir(g.G,0);return '<path d="M'+f(q.x)+','+f(q.y)+' L'+f(q.x+u.x*m)+','+f(q.y+u.y*m)+'" fill="none" stroke="#fff" stroke-width="'+f(2*m)+'" stroke-dasharray="none" stroke-linecap="butt"/>';})()+'</mask>';
        mk=' mask="url(#'+id+')"';
      }
      h+='<path class="lp" d="'+d+'" fill="none"'+mk+(o.an&&o.an.p?' style="'+o.an.p+'"':'')+'/>';
      if(dd)h+='<path class="ld" d="'+d+'" fill="none" stroke-width="'+f(dd*g.w)+'" stroke-dasharray="0 '+f(lnDg(s))+'" stroke-linecap="round"'+mk+(o.an&&o.an.d?' style="'+o.an.d+'"':'')+'/>';
      g.c.forEach(c=>{if(c)h+='<path class="le" d="'+c.d+'" fill="none" stroke-width="'+f(c.w)+'" stroke-dasharray="none" stroke-linecap="'+(c.cap||'butt')+'" stroke-linejoin="'+(c.j||'round')+'"'+(c.j==='miter'?' stroke-miterlimit="20"':'')+'/>';});
      return h;
    }
    function lnCv(s){
      const B=bindsOf(s),bg=B.own.gp||B.grp.gp,bf=B.own.fv||B.grp.fv,o={};
      if(bg){const v=parseFloat(bg.val.v);o.ga=isNaN(v)?lnGp(s):clamp(v,0,100);o.pl=true;}
      let RM=false;try{RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
      if(!pvl()||RM)return o;
      let v=lnFv(s);
      if(bf){const x=parseFloat(bf.val.v);v=bf.val.paused||isNaN(x)?0:x*(bf.val.rev?-1:1);}
      if(!v)return o;
      const P=lnPer(s),G=lnDd(s)?lnDg(s):0,A=(L)=>'--lnp:'+f(-L)+'px;animation:ed-lnf '+f(L/Math.abs(v))+'s linear infinite'+(v<0?' reverse':'');
      o.an={p:P?A(P):'',d:G?A(G):''};
      return o;
    }
    function lnMid(s){
      const G=lnSegs(s.p,s.tens);if(!G.length)return s.p[0]||{x:0,y:0};
      const L=lnLen(G)/2;let acc=0;
      for(const g of G){let q=g.a;for(let i=1;i<=24;i++){const r=g.l?{x:g.a.x+(g.b.x-g.a.x)*i/24,y:g.a.y+(g.b.y-g.a.y)*i/24}:bzAt(g,i/24),dl=Math.hypot(r.x-q.x,r.y-q.y);if(acc+dl>=L)return r;acc+=dl;q=r;}}
      return G[G.length-1].b;
    }
    function bxLine(b,s){
      const g=lnGeo(s),h=g.w/2;
      g.G0.forEach(q=>{const B=bx();bxCubic(B,q.a,q.c1,q.c2,q.b);bxAdd(b,B.x0-h,B.y0-h);bxAdd(b,B.x1+h,B.y1+h);});
      g.c.forEach(c=>{if(c)c.b.forEach(q=>bxAdd(b,q.x,q.y));});
    }
    const PUNT={label:1,icon:1};
    function elMat(s){
      const r=((Math.round((+s.rot||0)/90)%4)+4)%4,cs=[1,0,-1,0][r],sn=[0,1,0,-1][r],m=s.fl?-1:1;
      return[m*cs,m*sn,-sn,cs];
    }
    function elTr(s,p){
      const M=elMat(s);
      if(M[0]===1&&M[1]===0&&M[2]===0&&M[3]===1)return '';
      const e=p.x-M[0]*p.x-M[2]*p.y,g=p.y-M[1]*p.x-M[3]*p.y;
      return ' transform="matrix('+M.join(' ')+' '+f(e)+' '+f(g)+')"';
    }
    function isEl(s){return !!PUNT[s.t];}
    function isCard(s){return !!s&&s.t==='card';}
    function posOf(s){return{x:s.x||0,y:s.y||0};}
    const icons=new Map(),icQ=new Set();let icT=null;
    function iconPath(name){
      if(!name)return '';
      if(icons.has(name))return icons.get(name);
      if(ICON_RE.test(name)){icQ.add(name);clearTimeout(icT);icT=setTimeout(resolveIcons,300);}
      return null;
    }
    function resolveIcons(){
      const want=[...icQ].filter(n=>!icons.has(n)&&(S.objects.some(s=>s.icon===n)||RULS().some(r=>rSymI(r)===n)));
      icQ.clear();want.forEach(icWait);
    }
    const icP=new Map();
    function icWait(name){
      if(!ICON_RE.test(name))return Promise.resolve();
      let p=icP.get(name);
      if(!p){p=lookIcon(name).finally(()=>{icP.delete(name);});icP.set(name,p);}
      return p;
    }
    async function lookIcon(name){
      icons.set(name,null);
      let d='';
      try{
        await customElements.whenDefined('ha-icon');
        const el=document.createElement('ha-icon');
        el.icon=name;
        el.style.cssText='position:absolute;left:-9999px;top:0;width:24px;height:24px';
        document.body.appendChild(el);
        for(let i=0;i<80&&!d;i++){
          await new Promise(r=>setTimeout(r,50));
          const sv=el.shadowRoot&&el.shadowRoot.querySelector('ha-svg-icon');
          const pt=sv&&sv.shadowRoot&&sv.shadowRoot.querySelector('path');
          if(pt)d=pt.getAttribute('d')||'';
        }
        el.remove();
      }catch(_){}
      icons.set(name,d);
      if(!d)setTimeout(()=>{if(icons.get(name)==='')icons.delete(name);},30000);
      render();
    }
    function ptsOf(s){
      return s.t==='reg'
        ? regular(s.cx,s.cy,s.rr,Math.max(3,Math.min(64,s.sides||6)),(s.rot||0)*Math.PI/180)
        : s.p;
    }
    function geom(s){
      if(s.t==='line')return{tag:'g',a:{},in:lnInner(s)};
      if(s.t==='poly'||s.t==='reg'){
        const q=ptsOf(s);
        return{tag:'path',a:{d:crOn(q,s.tens)?splinePath(q,s.tens):roundPoly(q,s.r||0)}};
      }
      if(s.t==='rect'||s.t==='card')return{tag:'rect',a:{x:f(s.x),y:f(s.y),width:f(s.w),height:f(s.h),rx:f(s.r||0)}};
      if(s.t==='circle')return{tag:'circle',a:{cx:f(s.cx),cy:f(s.cy),r:f(s.rr)}};
      if(s.t==='callout')return{tag:'path',a:{d:coPath(s)}};
      return{tag:'path',a:{d:ringPath(s)}};
    }
    function tagOf(s,extra){const g=geom(s);const at=Object.entries(g.a).map(([k,v])=>k+'="'+v+'"').join(' ');
      return '<'+g.tag+(at?' '+at:'')+(extra?' '+extra:'')+'>'+(g.in||'')+'</'+g.tag+'>';}
    function centre(s){
      if(isEl(s))return posOf(s);
      if(s.t==='reg')return{x:s.cx,y:s.cy};
      if(s.t==='poly')return s.p.reduce((a,q)=>({x:a.x+q.x/s.p.length,y:a.y+q.y/s.p.length}),{x:0,y:0});
      if(s.t==='line')return lnMid(s);
      if(s.t==='rect'||s.t==='card')return{x:s.x+s.w/2,y:s.y+s.h/2};
      if(s.t==='circle')return{x:s.cx,y:s.cy};
      if(s.t==='callout')return{x:s.x+s.w/2,y:s.y+s.h/2};
      const a=(s.a0+s.a1)/2*Math.PI/180,r=(s.r1+s.r2)/2;
      return{x:s.cx+r*Math.cos(a),y:s.cy+r*Math.sin(a)};
    }
    function move(s,dx,dy,body){
      if(isEl(s)){s.x=(s.x||0)+dx;s.y=(s.y||0)+dy;return;}
      if(s.t==='poly'||s.t==='line')s.p=s.p.map(q=>Object.assign({},q,{x:q.x+dx,y:q.y+dy}));
      else if(s.t==='rect'||s.t==='card'){s.x+=dx;s.y+=dy;}
      else if(s.t==='callout'){s.x+=dx;s.y+=dy;if(!body){s.px+=dx;s.py+=dy;}}
      else{s.cx+=dx;s.cy+=dy;}
    }
    function snapPts(s){
      if(isEl(s))return[posOf(s)];
      if(s.t==='reg')return[{x:s.cx,y:s.cy}].concat(ptsOf(s));
      if(s.t==='poly'||s.t==='line')return s.p.map(q=>({x:q.x,y:q.y})).concat([centre(s)]);
      if(s.t==='rect'||s.t==='card')return[{x:s.x,y:s.y},{x:s.x+s.w,y:s.y},{x:s.x,y:s.y+s.h},{x:s.x+s.w,y:s.y+s.h},centre(s)];
      if(s.t==='callout')return[{x:s.x,y:s.y},{x:s.x+s.w,y:s.y},{x:s.x,y:s.y+s.h},{x:s.x+s.w,y:s.y+s.h},centre(s),coInfo(s).tip];
      return[{x:s.cx,y:s.cy}];
    }
    function bx(){return{x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity};}
    function bxAdd(b,x,y){if(x<b.x0)b.x0=x;if(x>b.x1)b.x1=x;if(y<b.y0)b.y0=y;if(y>b.y1)b.y1=y;}
    function bxQuad(b,a,c,e){
      bxAdd(b,a.x,a.y);bxAdd(b,e.x,e.y);
      ['x','y'].forEach(k=>{
        const dn=a[k]-2*c[k]+e[k];if(Math.abs(dn)<1e-12)return;
        const t=(a[k]-c[k])/dn;
        if(t>0&&t<1){const u=1-t;bxAdd(b,u*u*a.x+2*u*t*c.x+t*t*e.x,u*u*a.y+2*u*t*c.y+t*t*e.y);}
      });
    }
    function bxCubic(b,p0,p1,p2,p3){
      bxAdd(b,p0.x,p0.y);bxAdd(b,p3.x,p3.y);
      const at=t=>{const u=1-t;return{x:u*u*u*p0.x+3*u*u*t*p1.x+3*u*t*t*p2.x+t*t*t*p3.x,
                                      y:u*u*u*p0.y+3*u*u*t*p1.y+3*u*t*t*p2.y+t*t*t*p3.y};};
      ['x','y'].forEach(k=>{
        const a=-p0[k]+3*p1[k]-3*p2[k]+p3[k],bb=2*(p0[k]-2*p1[k]+p2[k]),c=p1[k]-p0[k];
        const ts=[];
        if(Math.abs(a)<1e-12){if(Math.abs(bb)>1e-12)ts.push(-c/bb);}
        else{const D=bb*bb-4*a*c;if(D>=0){const r=Math.sqrt(D);ts.push((-bb+r)/(2*a),(-bb-r)/(2*a));}}
        ts.forEach(t=>{if(t>0&&t<1){const q=at(t);bxAdd(b,q.x,q.y);}});
      });
    }
    function bxPoly(b,p,r,tens){
      const n=p.length;if(!n)return;
      if(crOn(p,tens)&&n>=3){
        crSegs(p,tens,true).forEach(g=>{if(g.l){bxAdd(b,g.a.x,g.a.y);bxAdd(b,g.b.x,g.b.y);}else bxCubic(b,g.a,g.c1,g.c2,g.b);});
        return;
      }
      if(r>0&&n>=2){
        for(let i=0;i<n;i++){
          const c=p[i],a=p[(i-1+n)%n],e=p[(i+1)%n];
          const la=Math.hypot(a.x-c.x,a.y-c.y)||1,lb=Math.hypot(e.x-c.x,e.y-c.y)||1,rr=Math.min(r,la/2,lb/2);
          bxQuad(b,{x:c.x+(a.x-c.x)/la*rr,y:c.y+(a.y-c.y)/la*rr},c,{x:c.x+(e.x-c.x)/lb*rr,y:c.y+(e.y-c.y)/lb*rr});
        }
        return;
      }
      p.forEach(q=>bxAdd(b,q.x,q.y));
    }
    function bxShape(b,s){
      if(isEl(s)){
        const p=posOf(s);
        if(s.t==='icon'){const h=(s.size||28)/2;bxAdd(b,p.x-h,p.y-h);bxAdd(b,p.x+h,p.y+h);}
        else bxAdd(b,p.x,p.y);
        return;
      }
      if(s.t==='rect'||s.t==='card'){bxAdd(b,s.x,s.y);bxAdd(b,s.x+s.w,s.y+s.h);return;}
      if(s.t==='circle'){bxAdd(b,s.cx-s.rr,s.cy-s.rr);bxAdd(b,s.cx+s.rr,s.cy+s.rr);return;}
      if(s.t==='poly'||s.t==='reg'){bxPoly(b,ptsOf(s),s.r||0,s.tens||0);return;}
      if(s.t==='line'){bxLine(b,s);return;}
      if(s.t==='callout'){
        const g=coInfo(s);
        bxAdd(b,g.x,g.y);bxAdd(b,g.x+g.w,g.y+g.h);
        if(g.inside)return;
        if(g.tail==='bubbles'){coBubbles(g,s).forEach(q=>{bxAdd(b,q.x-q.r,q.y-q.r);bxAdd(b,q.x+q.r,q.y+q.r);});return;}
        if(g.tail==='curved'){
          const o=coBend(g,s);
          bxQuad(b,g.p1,{x:(g.p1.x+g.tip.x)/2+o.x,y:(g.p1.y+g.tip.y)/2+o.y},g.tip);
          bxQuad(b,g.tip,{x:(g.tip.x+g.p2.x)/2+o.x,y:(g.tip.y+g.p2.y)/2+o.y},g.p2);
          return;
        }
        const r=g.tail==='line'&&Math.hypot(g.tip.x-g.c.x,g.tip.y-g.c.y)>coDot(s)*2?coDot(s):0;
        bxAdd(b,g.tip.x-r,g.tip.y-r);bxAdd(b,g.tip.x+r,g.tip.y+r);
        return;
      }
      const a0=s.a0,a1=a0+Math.max(0,Math.min(359.9,s.a1-a0));
      const P=(r,a)=>bxAdd(b,s.cx+r*Math.cos(a*Math.PI/180),s.cy+r*Math.sin(a*Math.PI/180));
      P(s.r2,a0);P(s.r2,a1);
      if(s.r1>0){P(s.r1,a0);P(s.r1,a1);}else bxAdd(b,s.cx,s.cy);
      for(let q=Math.ceil(a0/90)*90;q<=a1;q+=90)P(s.r2,q);
    }
    function bboxOf(list){const b=bx();list.forEach(s=>bxShape(b,s));return b;}
    function boxPts(b){
      if(!isFinite(b.x0))return[];
      return[{x:b.x0,y:b.y0},{x:b.x1,y:b.y0},{x:b.x0,y:b.y1},{x:b.x1,y:b.y1},{x:(b.x0+b.x1)/2,y:(b.y0+b.y1)/2}];
    }
    function ownPts(list,hit){
      const mv=movers(list),fg=fullG(list),us=[],done=new Set();
      list.forEach(q=>{
        const u=fg.find(id=>inG(q,id));
        if(u!=null){
          if(done.has(u))return;done.add(u);
          const m=members(u);us.push({h:m.indexOf(hit)>=0,p:boxPts(bboxOf(m))});return;
        }
        if(mv.indexOf(q)<0)return;
        us.push({h:q===hit,p:snapPts(q)});
      });
      us.sort((a,b)=>(b.h?1:0)-(a.h?1:0));
      return [].concat(...us.map(u=>u.p));
    }
    function anchors(skip){
      const a=[];
      S.objects.forEach((s,i)=>{if(i!==skip&&onPg(s)&&!vHid(s))a.push(...snapPts(s));});
      return a;
    }
    let snapped=null,guides=[];
    let gHit={x:[],y:[]};
    const gHitReset=()=>{gHit={x:[],y:[]};};
    const gHitAdd=(k,id)=>{const a=gHit[k];if(id!=null&&a[a.length-1]!==id)a.push(id);};
    const gById=id=>(S.guides||[]).find(g=>g.id===id)||null;
    const gTouchP=(pts,g)=>pts.some(p=>Math.abs((g.v?p.x:p.y)-g.c)<=.5);
    const gTouch=(s,g)=>gTouchP(snapPts(s),g);
    const gTouchG=(G,g)=>gTouchP(boxPts(bboxOf(members(G.id))),g);
    const gAxis=g=>g.v?'x':'y';
    function gNewId(){return (S.guides||[]).reduce((m,g)=>Math.max(m,+g.id||0),0)+1;}
    function glLink(list){
      const fg=fullG(list);
      const one=(o,touch)=>['x','y'].forEach(k=>{
        for(let j=gHit[k].length-1;j>=0;j--){
          const g=gById(gHit[k][j]);
          if(g&&gAxis(g)===k&&touch(g)){o.gl=Object.assign({},o.gl,{[k]:g.id});break;}
        }
      });
      fg.forEach(id=>{const G=grpOf(id);if(G&&!members(id).some(locked))one(G,g=>gTouchG(G,g));});
      list.forEach(s=>{if(s&&!locked(s)&&!fg.some(id=>inG(s,id)))one(s,g=>gTouch(s,g));});
    }
    const gOnG=(o,g)=>!!(g&&g.id!=null&&o.gl&&o.gl[gAxis(g)]===g.id);
    const gLinkedG=g=>(S.groups||[]).filter(G=>gOnG(G,g));
    const gLinkedS=g=>S.objects.filter(s=>gOnG(s,g));
    function gLinked(g,all){
      const out=new Set();
      gLinkedG(g).forEach(G=>{const m=members(G.id);if(all||!m.some(locked))m.forEach(q=>out.add(q));});
      gLinkedS(g).forEach(q=>{if(all||!locked(q))out.add(q);});
      return [...out];
    }
    const gLinkedN=g=>gLinkedG(g).length+gLinkedS(g).length;
    function moveGuide(g,c){
      c=iv(c);const d=c-g.c;g.c=c;
      if(!d)return;
      gLinked(g).forEach(s=>{move(s,g.v?d:0,g.v?0:d);intS(s);});
    }
    function glFix(){
      const G=S.guides||[];let n=gNewId();
      G.forEach(g=>{if(g.id==null||G.some(h=>h!==g&&h.id===g.id&&G.indexOf(h)<G.indexOf(g)))g.id=n++;});
      const fix=(o,touch)=>{
        if(!o.gl)return;
        ['x','y'].forEach(k=>{
          if(!(k in o.gl))return;
          const g=gById(o.gl[k]);
          if(!g||gAxis(g)!==k||!touch(g))delete o.gl[k];
        });
        if(!Object.keys(o.gl).length)delete o.gl;
      };
      S.objects.forEach(s=>fix(s,g=>gTouch(s,g)));
      (S.groups||[]).forEach(X=>fix(X,g=>gTouchG(X,g)));
    }
    const gOn=()=>E.gdon.checked&&!pvl();
    function snapCore(own,d,anc){
      snapped=null;guides=[];
      if(!own.length)return d;
      const out={x:d.x,y:d.y},sv=E.sv.checked;
      const GS=gOn()?(S.guides||[]):[];
      const pts=sv?anc.slice():[];
      GS.forEach(g=>{if(g.v)GS.forEach(h=>{if(!h.v)pts.push({x:g.c,y:h.c,gx:g.id,gy:h.id});});});
      let bd=12/zoom,best=null;
      for(const o of own){
        const x=o.x+d.x,y=o.y+d.y;
        for(const a of pts){const dd=Math.hypot(a.x-x,a.y-y);if(dd<bd){bd=dd;best={o:o,a:a};}}
      }
      if(best){
        snapped={x:best.a.x,y:best.a.y,k:'v'};
        if(best.a.gx!=null){gHitAdd('x',best.a.gx);gHitAdd('y',best.a.gy);}
        return{x:best.a.x-best.o.x,y:best.a.y-best.o.y};
      }
      let rx=null,ry=null,bx=8/zoom,by=8/zoom,sx=Infinity,sy=Infinity;
      for(const o of own){
        const x=o.x+d.x,y=o.y+d.y;
        if(sv)for(const a of anc){
          const ex=Math.abs(a.x-x),ox=Math.abs(a.y-y);
          if(ex<bx-1e-9||(ex<=bx+1e-9&&rx&&ox<sx)){bx=ex;sx=ox;rx={o:o,c:a.x,q:a.y};}
          const ey=Math.abs(a.y-y),oy=Math.abs(a.x-x);
          if(ey<by-1e-9||(ey<=by+1e-9&&ry&&oy<sy)){by=ey;sy=oy;ry={o:o,c:a.y,q:a.x};}
        }
        GS.forEach((g,i)=>{
          const e=Math.abs(g.c-(g.v?x:y));
          if(g.v&&(e<bx-1e-9||(e<=bx+1e-9&&rx&&0<sx))){bx=e;sx=0;rx={o:o,c:g.c,fx:i};}
          if(!g.v&&(e<by-1e-9||(e<=by+1e-9&&ry&&0<sy))){by=e;sy=0;ry={o:o,c:g.c,fx:i};}
        });
      }
      if(rx)out.x=rx.c-rx.o.x;
      if(ry)out.y=ry.c-ry.o.y;
      if(rx&&rx.fx!=null&&GS[rx.fx])gHitAdd('x',GS[rx.fx].id);
      if(ry&&ry.fx!=null&&GS[ry.fx])gHitAdd('y',GS[ry.fx].id);
      let gx=false,gy=false;
      if(E.sg.checked){
        const g=S.grid,o=own[0];
        if(!rx){out.x=Math.round((o.x+out.x)/g)*g-o.x;gx=true;}
        if(!ry){out.y=Math.round((o.y+out.y)/g)*g-o.y;gy=true;}
      }
      if(rx)guides.push(rx.fx!=null?{fx:rx.fx}:{v:1,c:rx.c,p:rx.o.y+out.y,q:rx.q});
      if(ry)guides.push(ry.fx!=null?{fx:ry.fx}:{v:0,c:ry.c,p:ry.o.x+out.x,q:ry.q});
      if(gx&&gy)snapped={x:own[0].x+out.x,y:own[0].y+out.y,k:'g'};
      return out;
    }
    function snap2(p,skip,anc){
      const t=snapCore([p],{x:0,y:0},anc||anchors(skip));
      return{x:p.x+t.x,y:p.y+t.y};
    }
    function snapMove(own,d,anc){return snapCore(own,d,anc);}
    function unsnap(){snapped=null;guides=[];}
    function pt(e){const m=cv.getScreenCTM().inverse(),p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m);return{x:p.x,y:p.y};}

    const op01=v=>typeof v==='number'&&isFinite(v)?+clamp(v,0,1).toFixed(2):1;
    const bgOp=()=>{const b=BGS().find(q=>q.p);return b?bglNow(b).o:1;};
    const bgBase=()=>(BGS().find(q=>q.p)||{}).p||'';
    function phoNow(s,I){
      const fo=!!IM(phView(s,I)).follow,B=phoOf(stysOf(s),fo),R=phoOf(evLayers(s),fo);
      let o=B.o==null?1:B.o;
      if(folRule(s,'opacity',I)){const fo=folNow(s,'opacity',I);o=fo==null?0:fo;}
      const bo=bindsOf(s),bv=b=>b?clamp(parseFloat(b.val.v)||0,0,1):null;
      if(bo.own.op)o=bv(bo.own.op);
      if(R.o!=null)o=R.o;
      if(bo.own.op&&bo.own.op.gs)o=bv(bo.own.op);
      if(bo.grp.op)o*=bv(bo.grp.op);
      return {o:o,m:R.m||B.m||'normal',t:R.t||B.t||'none',v:R.v!=null?R.v:B.v!=null?B.v:null};
    }
    function bglNow(b){
      const L=[];
      RULS().slice().reverse().forEach(r=>{if(rKind(r)==='cond'&&rOn(r).indexOf(b.id)>=0&&rCanvas(r))L.push(...idsStys(rSty(r)));});
      L.push(...tapLay([b.id]));
      const B=phoOf(stysOf(b)),R=phoOf(L);
      return {o:R.o!=null?R.o:B.o!=null?B.o:1,m:R.m||B.m||'normal',t:R.t||B.t||'none'};
    }
    function phVis(s){
      const A=phAll(s);
      if(!pvl()&&sel>=0&&S.objects[sel]===s&&phOpen(s)>=0)return phOpen(s);
      if(A.length>1)for(const r of RULS()){
        if(rKind(r)!=='cond'||!rHas(r,s)||!rCanvas(r))continue;
        const x=fxOf(r,'pho');if(!x)continue;
        const i=A.findIndex(I=>I.p&&phName(s,I)===x.n);if(i>=0)return i;
      }
      return phDef(s);
    }
    function opacityOf(s,I){
      if(I&&phAll(s).indexOf(I)!==phVis(s))return 0;
      const o=phoNow(s,I).o;
      if(!pvl()&&isSel(s))return Math.max(o,bgOp());
      if(pvl()&&fadeIn)return 0;
      return o;
    }
    function tfStack(L){
      let p=null,t=null;
      L.forEach(x=>{if(stX(x))p=stState(x,'n');if(stHas(x,'t'))t=x;});
      return {p:p,t:t};
    }
    function tfRules(id){
      const L=[];
      RULS().slice().reverse().forEach(r=>{if(rKind(r)==='cond'&&rOn(r).indexOf(id)>=0&&rCanvas(r))L.push(...idsStys(rSty(r)));});
      return L.concat(tapLay([id]));
    }
    function tfSet(el,M){
      (el._tfk||[]).forEach(k=>{if(!(k in M))el.style.removeProperty(k);});
      Object.keys(M).forEach(k=>{if(el.style.getPropertyValue(k)!==M[k])el.style.setProperty(k,M[k]);});
      el._tfk=Object.keys(M);
    }
    const lastWh=L=>L.filter(anWhole).slice(-1)[0]||null;
    function anGrpNow(s){
      const C=chainOf(s);if(!C.length)return null;
      for(const q of litLys()){const x=q.x,g=(x.to||[]).find(id=>C.indexOf(id)>=0),st=g&&lastWh(idsStys(x.sty));if(st)return {g:g,st:st};}
      for(const r of RULS()){if(rKind(r)!=='cond'||!rCanvas(r))continue;const g=rOn(r).find(id=>C.indexOf(id)>=0),st=g&&lastWh(idsStys(rSty(r)));if(st)return {g:g,st:st};}
      return null;
    }
    function anOwnNow(s){
      for(const q of litLys()){const x=q.x,st=(x.to||[]).indexOf(s.id)>=0&&lastWh(idsStys(x.sty));if(st)return st;}
      for(const r of RULS()){if(rKind(r)==='cond'&&rOn(r).indexOf(s.id)>=0&&rCanvas(r)){const st=lastWh(idsStys(rSty(r)));if(st)return st;}}
      return lastWh(stysOf(s));
    }
    function tfCanvas(){
      const G=pvl()?tfGroups():[];
      let rm=false;try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
      const sids=stIds(),KF=new Map();
      const piece=(st,pid,b,z)=>{
        const bx={w:b.x1-b.x0,h:b.y1-b.y0},A=anOf(st,stState(st,'n'),'z',bx,'w');if(!A)return null;
        const nm='ed-pc-'+slug(pid)+'-'+sids.get(st.id),c=bxC(b),mv=anMv(st);KF.set(nm,'@keyframes '+nm+'{ '+A.kf+' }');
        if(mv)KF.set(nm+'-i','@keyframes '+nm+'-i{ '+kfInv(A.kf)+' }');
        const Z=z&&st.anim==='custom'&&moFam(st,'s')?anOf(st,stState(st,'n'),'z',bx,'ws'):null;
        if(Z)KF.set(nm+'-z','@keyframes '+nm+'-z{ '+Z.kf+' }');
        const Op=z&&mv&&st.anim==='custom'?anOf(st,stState(st,'n'),'z',bx,'o'):null;
        if(Op)KF.set(nm+'-o','@keyframes '+nm+'-o{ '+Op.kf+' }');
        return Object.defineProperties({animation:nm+' '+A.sh,'transform-box':'view-box','transform-origin':moPv(st)?pivPx(moPv(st),b):f(c.x)+'px '+f(c.y)+'px'},
          {mv:{value:mv},cu:{value:st.anim==='custom'},iv:{value:nm+'-i '+A.sh},zan:{value:Z?nm+'-z '+Z.sh:''},oan:{value:Op?nm+'-o '+Op.sh:''}});
      };
      const PC=S.objects.map(s=>{
        if(!pvl()||rm||isCard(s))return null;
        const g=anGrpNow(s),o=!isEl(s)&&phAll(s).some(I=>I.p)?anOwnNow(s):null;
        return {g:g?piece(g.st,g.g,grpBox(g.g)):null,o:o?piece(o,s.id,bboxOf([s]),true):null};
      });
      const kc=[...KF.values()].join('\n');if(E.pccss.textContent!==kc)E.pccss.textContent=kc;
      const gm=new Map(G.map(g=>{
        const T=tfStack(tfRules(g.G.id));
        return [g.G.id,{g:g,p:T.p,t:T.t?trX(T.t):g.t}];
      }));
      S.objects.forEach((s,i)=>{
        const fr=gShapes.children[i];if(!fr||isCard(s))return;
        const ch=chainOf(s).slice().reverse().map(id=>gm.get(id)).filter(Boolean),GM={};
        if(ch.length){
          GM.transform=ch.map(x=>{
            const c=x.g.c,p=x.p,mx=p?tfNum(p,'mx'):0,my=p?tfNum(p,'my'):0;
            return 'translate('+f(c.x+mx)+'px, '+f(c.y+my)+'px) rotate('+f(p?tfNum(p,'mr'):0)+'deg) scale('+f(p?tfNum(p,'ms')/100:1)+') translate('+f(-c.x)+'px, '+f(-c.y)+'px)';
          }).join(' ');
          GM['transform-box']='view-box';GM['transform-origin']='0 0';
          const t=ch.map(x=>x.t).filter(x=>x&&x!=='none')[0];
          GM.transition=t?t.split(', ').filter(x=>x.indexOf('translate')===0).map(x=>x.replace('translate','transform')).join(', '):'none';
        }
        const pc=PC[i];
        if(pc&&pc.g&&!GM.transform)Object.assign(GM,pc.g);
        const BS=pvl()?bindsOf(s):{own:{},grp:{}};
        if(GM.transform&&['mx','my','mr','ms'].some(q=>BS.grp[q]&&BS.grp[q].gs))delete GM.transform;
        if(!GM.transform){
          const G2=['mx','my','mr','ms'].map(q=>BS.grp[q]).filter(Boolean);
          if(G2.length){
            const n=q=>{const b=BS.grp[q];return b?parseFloat(b.val.v):null;},mx=n('mx'),my=n('my'),mr=n('mr'),ms=n('ms');
            if(mx!=null||my!=null)GM.translate=f(mx||0)+'px '+f(my||0)+'px';
            if(mr!=null)GM.rotate=f(mr)+'deg';
            if(ms!=null)GM.scale=moSc(String(ms),BS.grp.ms.x.ay);
            GM['transform-box']='view-box';GM['transform-origin']=pivPx(G2[0].x.pv,grpBox(G2[0].g));
          }
        }
        tfSet(fr,GM);
        const IA={},IB={};
        if(GM.transform){
          IA.transform=ch.slice().reverse().map(x=>{
            const c=x.g.c,p=x.p,mx=p?tfNum(p,'mx'):0,my=p?tfNum(p,'my'):0;
            return 'translate('+f(c.x)+'px, '+f(c.y)+'px) scale('+rcv(String(f(p?tfNum(p,'ms')/100:1)))+') rotate('+ngv(f(p?tfNum(p,'mr'):0)+'deg')+') translate('+ngv(f(c.x+mx)+'px')+', '+ngv(f(c.y+my)+'px')+')';
          }).join(' ');
          IA.transition=GM.transition;
        }else{
          if(pc&&pc.g&&pc.g.mv)(pc.g.cu?IB:IA).animation=pc.g.iv;
          ['translate','rotate','scale'].forEach(k=>{if(!GM[k])return;const d=invDecl(k+': '+GM[k]),j=d.indexOf(':');IB[d.slice(0,j)]=d.slice(j+1).trim();});
        }
        if(GM['transform-box'])[IA,IB].forEach(X=>{X['transform-box']=GM['transform-box'];X['transform-origin']=GM['transform-origin'];});
        const T=pvl()?tfStack(stysOf(s).concat(tfRules(s.id))):{p:null,t:null},k=s.t==='label'?'l':s.t==='icon'?'i':'z';
        const M={};
        if(T.p){
          const fo=!isEl(s)&&phAll(s).some(I=>I.p&&I.follow);
          tfDecl(T.p,fo?'p':k).forEach(d=>{const j=d.indexOf(':');M[d.slice(0,j)]=d.slice(j+1).trim();});
          if(fo){const c=bxC(bboxOf([s]));M['transform-box']='view-box';M['transform-origin']=f(c.x)+'px '+f(c.y)+'px';}
        }
        const OB=['mx','my','mr','ms'].filter(q=>BS.own[q]),tfR=tfRules(s.id).some(stX);
        if(OB.length&&(!tfR||OB.some(q=>BS.own[q].gs))){
          const P0=T.p||{},n=q=>BS.own[q]?parseFloat(BS.own[q].val.v):tfNum(P0,q);
          const mx=n('mx'),my=n('my'),mr=n('mr'),ms=BS.own.ms?parseFloat(BS.own.ms.val.v)*100:tfNum(P0,'ms');
          M.translate=tfTr(mx,my,k);M.rotate=tfRot(mr,k);M.scale=moSc(String(f(ms/100)),BS.own.ms&&BS.own.ms.x.ay);
          const x0=BS.own[OB[0]].x;
          if(isEl(s)){M['transform-box']='fill-box';M['transform-origin']=pivKw(x0.pv);}
          else{M['transform-box']='view-box';M['transform-origin']=pivPx(x0.pv,bboxOf([s]));}
        }
        if(isEl(s)){
          const l=fr.querySelector('.zt,.zi');if(!l)return;
          const v=tfVars(s);if(v)v.split('; ').forEach(d=>{const j=d.indexOf(':');M[d.slice(0,j)]=d.slice(j+1).trim();});
          tfSet(l,M);spAll(fr,s,BS);frCanvas(fr,s,BS);return;
        }
        const Z=Object.assign({},M);
        if(T.t)Z.transition=trX(T.t);
        fr.querySelectorAll('.z,.lbl').forEach(e=>tfSet(e,Z));
        const ow=pc&&pc.o||{},om=!!(pc&&pc.o&&pc.o.mv),owB={};
        ['transform-box','transform-origin'].forEach(k=>{if(k in ow)owB[k]=ow[k];});
        const zl=fr.querySelector('.zl');if(zl)tfSet(zl,Object.assign({},M,ow,ow.zan?{animation:ow.zan}:{}));
        phAll(s).forEach((I,j)=>{
          const o=ovN.get(s.id+'#'+j);if(!o)return;
          tfSet(o.el,Object.assign({},I.follow?M:{},I.follow||!om?ow:ow.oan?{animation:ow.oan}:{}));
          if(o.w){tfSet(o.w,IA);tfSet(o.w.firstElementChild,IB);}
        });
        const RZ=Object.assign({},Z,om?ow:owB),mk=agOf(s).length?gClips.querySelector('#ed-'+slug(s.id)+'-k'):null,fg=mk&&mk.firstElementChild;
        if(fg){tfSet(fg,GM);if(fg.firstElementChild)tfSet(fg.firstElementChild,RZ);}
        else if(tfClip(s)){const q=gClips.querySelector('#ed-'+slug(s.id)+'-m');if(q&&q.firstElementChild)tfSet(q.firstElementChild,RZ);
          gClips.querySelectorAll('[data-fdm="'+slug(s.id)+'"]').forEach(e=>tfSet(e,RZ));}
        spAll(fr,s,BS);frCanvas(fr,s,BS);
      });
    }
    function frCanvas(fr,s,BS){
      const G=fr.querySelectorAll('.pf .fr');if(!G.length)return;
      const D={};
      if(pvl()){
        const b=BS.own.fr||BS.grp.fr;
        if(b){D.rotate=b.val.v;D.transition='rotate '+bindTm(b.x)+'ms ease';}
        let rm=false;try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
        const st=rm?null:stysOf(s).concat(evLayers(s)).filter(isFr).slice(-1)[0],A=st&&anOf(st,stState(st,'n'),'z',null,'r');
        if(A)D.animation='ed-anim-'+stIds().get(st.id)+'-fr '+A.sh;
      }
      G.forEach(g=>spSet(g,D));
    }
    function spSet(el,D){
      if(!el)return;
      (el._spk||[]).forEach(k=>{if(!(k in D))el.style.removeProperty(k);});
      Object.keys(D).forEach(k=>{if(el.style.getPropertyValue(k)!==D[k])el.style.setProperty(k,D[k]);});
      el._spk=Object.keys(D);
    }
    function spAll(fr,s,BS){
      const b=BS.own.sp||BS.grp.sp,D=b?{'animation-duration':b.val.v,'animation-play-state':b.val.paused?'paused':'running'}:{};
      spSet(fr,D);spSet(fr.querySelector('.zl,.zt,.zi'),D);
      phAll(s).forEach((I,j)=>{const o=ovN.get(s.id+'#'+j);if(!o)return;spSet(o.el,D);if(o.w){spSet(o.w,D);spSet(o.w.firstElementChild,D);}});
      if(isEl(s))return;
      const k=gClips.querySelector('#ed-'+slug(s.id)+'-k')||gClips.querySelector('#ed-'+slug(s.id)+'-m');
      if(k)k.querySelectorAll('*').forEach(e=>spSet(e,D));
    }
    let pgAnim=null,pgKeep=null;
    function pgStop(){
      pgKeep=null;
      if(!pgAnim)return;
      pgAnim.L.forEach(a=>{try{a.cancel();}catch(_){}});pgAnim.g.remove();pgAnim=null;pgHold=false;
    }
    function pgPlay(x){
      const to=x.pg,from=cpg();
      if(!pgOf(to)||to===from||pgAnim)return;
      const T=pgTrOf(x),RM=(()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}})();
      if(T.t==='none'||RM||!(flow&&flCv)||typeof gShapes.animate!=='function'){curPg=to;render();return;}
      const snap=id=>{
        const g=document.createElementNS(SVGNS,'g');
        S.objects.forEach((s,i)=>{if(s.pg!==id)return;const fr=gShapes.children[i];if(!fr||!fr.children.length)return;
          const c=fr.cloneNode(true);c.removeAttribute('clip-path');c.removeAttribute('mask');g.appendChild(c);});
        return g;
      };
      const wrap=(id,inner,o)=>{
        const A=pgA(pgOf(id)),cid='ed-pgx-'+(o?'o':'i'),cp=document.createElementNS(SVGNS,'clipPath'),rc=document.createElementNS(SVGNS,'rect');
        cp.id=cid;[['x',A.x],['y',A.y],['width',A.w],['height',A.h]].forEach(q=>rc.setAttribute(q[0],q[1]));cp.appendChild(rc);
        const g=document.createElementNS(SVGNS,'g');g.setAttribute('clip-path','url(#'+cid+')');
        inner.style.transformBox='view-box';inner.style.transformOrigin=f(A.x+A.w/2)+'px '+f(A.y+A.h/2)+'px';
        g.appendChild(cp);g.appendChild(inner);return {g:g,i:inner,A:A};
      };
      const O=wrap(from,snap(from),true);
      pgKeep=S.objects.filter(s=>(s.pg===from||s.pg===to)&&hasImg(s));
      curPg=to;pick([]);render();
      const I=wrap(to,snap(to),false);
      const host=document.createElementNS(SVGNS,'g');host.setAttribute('pointer-events','none');host.appendChild(O.g);host.appendChild(I.g);
      gShapes.parentNode.insertBefore(host,gShapes);
      pgHold=true;render();
      const to2=pgTime(T,true),ti=pgTime(T,false);
      const L=[O.i.animate(pgFrames(T,O.A,true),{duration:to2.d,easing:'ease-in-out',fill:'both'}),
        I.i.animate(pgFrames(T,I.A,false),{duration:ti.d,delay:ti.w,easing:'ease-in-out',fill:'both'})];
      pgAnim={g:host,L:L};
      const end=()=>{if(pgAnim&&pgAnim.L===L){pgStop();render();}};
      Promise.all(L.map(a=>a.finished)).then(end,end);
    }
    function pgCanvas(){
      const D=root.querySelector('#pgdefs');
      if(!hasPgs()){if(D.innerHTML)D.innerHTML='';}
      else{
        const A=pgA(pgOf(cpg())),r='x="'+A.x+'" y="'+A.y+'" width="'+A.w+'" height="'+A.h+'"';
        const h='<mask id="ed-pgm" maskUnits="userSpaceOnUse" x="'+(-S.w)+'" y="'+(-S.h)+'" width="'+(3*S.w)+'" height="'+(3*S.h)+'">'+
          '<rect x="'+(-S.w)+'" y="'+(-S.h)+'" width="'+(3*S.w)+'" height="'+(3*S.h)+'" fill="#555"/><rect '+r+' fill="#fff"/></mask>'+
          '<clipPath id="ed-pgc"><rect '+r+'/></clipPath>';
        if(D._h!==h){D._h=h;D.innerHTML=h;}
      }
      S.objects.forEach((s,i)=>{
        const fr=gShapes.children[i];if(!fr)return;
        const pg=hasPgs()&&!!s.pg&&onPg(s),m=pg&&!pvl()?'url(#ed-pgm)':'',c=pg&&pvl()?'url(#ed-pgc)':'';
        if((fr.getAttribute('mask')||'')!==m){if(m)fr.setAttribute('mask',m);else fr.removeAttribute('mask');}
        if((fr.getAttribute('clip-path')||'')!==c){if(c)fr.setAttribute('clip-path',c);else fr.removeAttribute('clip-path');}
      });
    }
    const zState=()=>'',eState=()=>'';
    function elCls(s){const c=stClass(s);return (s.t==='label'?'ldef':'idef')+(c?' '+c:'');}
    function stCanvas(){
      let css='',defs=[];
      const one=(st,c,ks)=>{ks.forEach(k=>{css+=stRules(st,edQ(c,!pvl(),k));});defs=defs.concat(stDefs(st,c,'ed-',{u:vurl}));};
      one(defSt(),'zdef',['z']);
      css+='#cv .zl.zimg{fill:transparent;stroke:none}\n#cv.pv g:hover>.zl.zimg{fill:transparent}\n';
      css+='#cv .zl.zln{stroke:'+ST_FV+';stroke-width:2}\n';
      one(defOf(-1),'ldef',['l']);one(defOf(-2),'idef',['i']);
      const ids=stIds();
      styles().forEach(x=>{if(x)one(x,ids.get(x.id),['z','l','i']);});
      const K=new Set();
      css+='#cv #cards .cds{clip-path:inset('+cdClip()+')}\n';
      styles().forEach(x=>{if(x)css+=cdStRule(x,'#cv #cards .card.'+ids.get(x.id)+' .cds','ed-anim-'+ids.get(x.id)+'-c',!pvl(),K);});
      css+='#cv .pf .fr{transform-box:view-box;transform-origin:0 0}\n';
      styles().filter(isFr).forEach(x=>{const A=anOf(x,stState(x,'n'),'z',null,'r');if(A)css+='@keyframes ed-anim-'+ids.get(x.id)+'-fr{ '+A.kf+' }\n';});
      styles().filter(x=>isAn(x)&&x.anim==='custom'&&moFam(x,'w')&&moFam(x,'s')).forEach(x=>['z','l','i'].forEach(k=>{
        const A=anOf(x,stState(x,'n'),k,null,'s');if(A)css+='@keyframes ed-anim-'+ids.get(x.id)+'-'+k+'-s{ '+A.kf+' }\n';}));
      return {css:css,defs:defs.join('')};
    }

    function normSt(){
      styles().forEach(x=>{if(x&&x.st){delete x.st.on;delete x.st.un;}});
      {const G=[];SGR().concat(styles().map(stGrp)).forEach(x=>{const g=typeof x==='string'?x.trim():'';if(g&&G.indexOf(g)<0)G.push(g);});
        if(G.length){if(JSON.stringify(G)!==JSON.stringify(S.sgr))S.sgr=G;}else delete S.sgr;}
      if(!S.so){
        const G=styles(),o=a=>{if(Array.isArray(a))a.sort((x,y)=>{const i=G.findIndex(q=>q&&q.id===x),j=G.findIndex(q=>q&&q.id===y);return (i<0?1e9:i)-(j<0?1e9:j);});};
        S.objects.concat(BGS()).forEach(q=>o(q&&q.sty));
        RULS().forEach(r=>(Array.isArray(r&&r.fx)?r.fx:[]).forEach(x=>{if(x)o(x.sty);}));
        S.so=1;
      }
      S.objects.forEach(s=>{
        if(s.sty!=null&&!Array.isArray(s.sty))s.sty=[+s.sty];
        if(Array.isArray(s.sty)&&!s.sty.length)delete s.sty;
      });
    }
    function anSplit(){
      const L=styles();if(!L.length)return;
      const after=(a,id,nid)=>{if(Array.isArray(a)){const i=a.indexOf(id);if(i>=0&&a.indexOf(nid)<0)a.splice(i+1,0,nid);}};
      for(let i=0;i<L.length;i++){
        const st=L[i];if(!st)continue;
        if(isAn(st)){
          if(!Array.isArray(st.use)||st.use.length!==1||st.use[0]!=='a')st.use=['a'];
          if(!AN[st.anim])st.anim='pulse';
          continue;
        }
        if('k' in st)delete st.k;
        const U=stUseOf(st);
        if(U.indexOf('a')<0)continue;
        const rest=U.filter(k=>k!=='a');
        if(!AN[st.anim]){if(Array.isArray(st.use))st.use=rest;continue;}
        if(!rest.length){st.k='a';st.use=['a'];st.hov=false;continue;}
        let n=(st.n||'Style')+' (animation)',k=2;while(L.some(x=>x&&x.n===n))n=(st.n||'Style')+' (animation '+(k++)+')';
        const A=newAnim(stNewId(),n),op=stState(st,'n');
        AN_F.forEach(f=>{if(f in st){A[f]=st[f];delete st[f];}});
        if(op&&op.op!=null)A.st.n.op=op.op;
        st.anim='';st.use=rest;
        L.splice(i+1,0,A);i++;
        S.objects.concat(BGS()).forEach(o=>after(o.sty,st.id,A.id));
        RULS().forEach(r=>(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{if(x&&(x.k==='look'||x.k==='act'))after(x.sty,st.id,A.id);}));
      }
    }
    function moFix(){
      let n=0;
      RULS().forEach(r=>(Array.isArray(r&&r.fx)?r.fx:[]).forEach(x=>{
        if(!x||x.k!=='follow'||x.p!=='opacity')return;
        const k=rCs(r)[0],map=x.map||'brightness',ps=[{t:0,op:0},{t:100,op:1}],J=JSON.stringify(ps);
        let st=styles().find(y=>isAn(y)&&y.anim==='custom'&&JSON.stringify(y.pp)==='["op"]'&&JSON.stringify(y.ps)===J&&!y.pv&&!y.ay);
        if(!st){let nm='photo opacity',q=2;while(styles().some(y=>y&&y.n===nm))nm='photo opacity '+(q++);
          st=newAnim(stNewId(),nm);st.anim='custom';st.pp=['op'];st.ps=ps;if(!Array.isArray(S.styles))S.styles=[];S.styles.push(st);}
        let i1=1;
        if(map==='brightness'&&k&&k.e){
          const h=self._hass,e=h&&h.states&&h.states[k.e],M=e&&(e.attributes||{}).supported_color_modes;
          const a=Array.isArray(M)&&M.length&&M.every(m=>m==='onoff')?'':'brightness';
          let c=(k.a||'')===a?k:CAUS().find(q=>q&&q.k==='data'&&q.e===k.e&&(q.a||'')===a);
          if(!c){c=newCause('data',k.e);if(a)c.a=a;c.n=(k.n||k.e)+(a?' brightness':'');}
          r.c=[c.id];if(a)i1=255;
        }
        const T=rOn(r).map(tgtOf).filter(Boolean).flatMap(o=>isGrp(o)?members(o.id):[o]).find(hasImg);
        const sy=T?stysOf(T).filter(q=>stHas(q,'t')).slice(-1)[0]:null;
        ['map','ph','dec','pre','suf'].forEach(q=>{if(q in x)delete x[q];});
        x.p='mo';x.mo=st.id;x.i0=0;x.i1=i1;x.tm=sy?Math.max(0,+sy.dur||0):0;
      }));
      const CONV=['op','mx','my','mr','ms','fc','fr'];
      RULS().forEach(r=>(Array.isArray(r&&r.fx)?r.fx:[]).forEach(x=>{
        if(!x||x.k!=='follow'||CONV.indexOf(x.p)<0)return;
        const p=x.p,O=bindOut(x),a={t:0},b={t:100},pv=/^m[xyrs]$/.test(p)&&PIV.some(q=>q[0]===x.pv)&&x.pv!=='c'?x.pv:'';
        a[p]=PROPS[p].c?O[0]:moNum(PROPS[p],O[0],0);b[p]=PROPS[p].c?O[1]:moNum(PROPS[p],O[1],0);
        if(p==='fc'){a.fa=bindA(x,0);b.fa=bindA(x,1);}
        const ps=JSON.stringify([a,b]);
        let st=styles().find(y=>isAn(y)&&y.anim==='custom'&&Array.isArray(y.pp)&&y.pp.length===1&&y.pp[0]===p&&JSON.stringify(y.ps)===ps&&(y.pv||'')===pv&&!y.ay);
        if(!st){
          const base=BIND_L[p]+(PROPS[p].c?'':' '+f(a[p])+' → '+f(b[p]));let nm=base,k=2;while(styles().some(y=>y&&y.n===nm))nm=base+' '+(k++);
          st=newAnim(stNewId(),nm);st.anim='custom';st.pp=[p];st.ps=[a,b];if(pv)st.pv=pv;if(!Array.isArray(S.styles))S.styles=[];S.styles.push(st);
        }
        x.p='mo';x.mo=st.id;['o0','o1','oa0','oa1','pv','an'].forEach(q=>{if(q in x)delete x[q];});
      }));
      styles().forEach(st=>{
        if(!isAn(st))return;
        if(st.anim!=='custom'){['pp','ps','pv'].forEach(k=>{if(k in st)delete st[k];});return;}
        n=Math.max(n,1);
        if(!Array.isArray(st.ps)){
          const p=PROPS[st.ap]?st.ap:'op',P=PROPS[p],a={t:0},b={t:100};
          a[p]=moNum(P,st.a0,P.v0);b[p]=moNum(P,st.a1,P.v1);st.pp=[p];st.ps=[a,b];
        }
        ['ap','a0','a1'].forEach(k=>{if(k in st)delete st[k];});
        const M=moOf(st),ps=M.ps.map(q=>Object.assign({t:q.t},q.v));
        if(JSON.stringify(st.pp)!==JSON.stringify(M.pp))st.pp=M.pp.slice();
        if(JSON.stringify(st.ps)!==JSON.stringify(ps))st.ps=ps;
        if('pv' in st&&!moPv(st))delete st.pv;
        if('ay' in st&&(M.pp.indexOf('ms')<0||st.ay!=='x'&&st.ay!=='y'))delete st.ay;
        if(M.pp.some(p=>MO_NEW.indexOf(p)>=0)||new Set(M.pp.map(p=>MO_FAM[p])).size>1)n=Math.max(n,2);
      });
      if(RULS().some(r=>rKind(r)==='data'&&isBind(rFol(r))&&bindWords(rCs(r)[0])))n=3;
      if(RULS().some(r=>rKind(r)==='tap'&&(rGest(r)!=='tap'||rOn(r).some(id=>isCard(objOf(id))))))n=4;
      if(RULS().some(r=>{const x=fxOf(r,'act');return !!x&&Array.isArray(x.to)&&x.to.some(id=>isCard(objOf(id)));}))n=5;
      if(RULS().some(r=>!!fxOf(r,'mv')))n=6;
      if(SPS().length)n=7;
      if(n)S.need=n;else if('need' in S)delete S.need;
    }
    const iv=v=>typeof v==='number'&&isFinite(v)?Math.round(v)+0:v;
    const IK={rect:['x','y','w','h','r'],callout:['x','y','w','h','r','px','py','tw'],poly:['r'],line:[],reg:['cx','cy','rr','r'],
      circle:['cx','cy','rr'],ring:['cx','cy','r1','r2'],label:['x','y','size'],icon:['x','y','size'],card:['x','y','w','h']};
    function intS(s){
      if(s.t==='callout'&&s.body==='line'){
        if(s.lo==='v'){if(s.w){s.x+=s.w/2;s.w=0;}}
        else if(s.h){s.y+=s.h/2;s.h=0;}
      }
      (IK[s.t]||[]).forEach(k=>{if(k in s)s[k]=iv(s[k]);});
      if((s.t==='poly'||s.t==='line')&&Array.isArray(s.p)&&s.p.some(q=>q.x!==iv(q.x)||q.y!==iv(q.y)))
        s.p=s.p.map(q=>Object.assign({},q,{x:iv(q.x),y:iv(q.y)}));
    }
    function ints(){S.objects.forEach(intS);(S.guides||[]).forEach(g=>{g.c=iv(g.c);});}
    function render(){fix2();spSync();normSt();anSplit();moFix();stImgFix();ints();gfix();pgfix();fixRules();glFix();drFix();resel();giro(()=>{draw();panels();});twSync();}
    function req(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;giro(()=>{draw();syncFields();});});}
    function draw(){
      if(!GM)return giro(draw);
      if(raf){cancelAnimationFrame(raf);raf=0;}
      if(zFit){const z=fitZ();if(z)zoom=z;}
      const geo=S.w+'|'+S.h+'|'+zoom+'|'+S.grid;
      if(geo!==lastGeo){
        lastGeo=geo;
        cv.setAttribute('viewBox','0 0 '+S.w+' '+S.h);
        cv.setAttribute('width',S.w*zoom);cv.setAttribute('height',S.h*zoom);
        E.zl.textContent=Math.round(zoom*100)+'%';
        const gv=S.grid*Math.max(1,Math.ceil(6/(S.grid*zoom)));
        E.gp.setAttribute('width',gv);E.gp.setAttribute('height',gv);
        E.gpp.setAttribute('d','M'+gv+',0 L0,0 0,'+gv);
      }
      cv.classList.toggle('pv',pvl());
      E.gb.style.display=(E.sg.checked&&!pvl())?'':'none';

      {
        const L=BGS().filter(b=>b.p),G=E.bgl;
        while(G.children.length>L.length)G.lastChild.remove();
        L.forEach((b,i)=>{
          let el=G.children[i];const u=vurl(b.p);
          if(!el||el.dataset.u!==u){
            const n=document.createElementNS(SVGNS,'image');n.setAttribute('draggable','false');n.setAttribute('href',u);n.dataset.u=u;
            if(el)G.replaceChild(n,el);else G.appendChild(n);el=n;
          }
          const P=bglNow(b),mode=pvl()?P.m:'normal',tr=pvl()?P.t:'none';
          if(el._tr!==tr){el._tr=tr;el.style.transition=tr;}
          if(el._m!==mode){el._m=mode;el.style.mixBlendMode=mode;}
          const v=String(P.o);if(el.style.opacity!==v)el.style.opacity=v;
          const ra={x:0,y:0,width:S.w,height:S.h,preserveAspectRatio:par()};
          for(const a in ra){const w=String(ra[a]);if(el.getAttribute(a)!==w)el.setAttribute(a,w);}
        });
      }

      const imgs=[];
      S.objects.forEach(z=>{if(onPg(z))phAll(z).forEach((I,i)=>{if(I.p&&(pvl()||opacityOf(z,I)>0))imgs.push({s:z,I:I,i:i,key:z.id+'#'+i});});});
      const clipZ=[...new Set(imgs.map(q=>q.s).concat(pgKeep||[]))];
      if(clipZ.length){
        const clips='<defs>'+clipZ.map(s=>'<clipPath id="ed-'+slug(s.id)+'">'+tagOf(s)+'</clipPath>'+
          (agOf(s).length?'<mask id="ed-'+slug(s.id)+'-k" maskUnits="userSpaceOnUse" x="'+(-S.w)+'" y="'+(-S.h)+'" width="'+(3*S.w)+'" height="'+(3*S.h)+'"><g>'+tagOf(s,'fill="#fff"')+'</g></mask>':
           tfClip(s)?'<clipPath id="ed-'+slug(s.id)+'-m">'+tagOf(s)+'</clipPath>':'')+
          fdStys(s).map(st=>{const k='ed-'+slug(s.id)+'-'+stIds().get(st.id),p=stState(st,'n');return fdGrad(p,k+'-fdg')+fdMask(s,k+'-fd',k+'-fdg',fdOf(p).k==='t')+
            (fdMv(s).indexOf(st)>=0?fdMaskMv(s,k+'-fdm','data-fdm="'+slug(s.id)+'"',k+'-fdg'):'');}).join('')).join('')+'</defs>';
        if(clips!==lastClips){lastClips=clips;gClips.innerHTML=clips;}
      }
      if(imgs.length){
        const keep=new Set();
        imgs.forEach(q=>{
          const s=q.s,I=q.I,V=phView(s,I);
          const P=phoNow(s,I);
          const mode=pvl()?P.m:'normal',tr=pvl()?P.t:'none';
          const an=!I.follow&&agOf(s).length>0,k=vurl(I.p)+'|'+slug(s.id)+(an?'|k':'');
          let o=ovN.get(q.key);
          if(!o||o.k!==k){
            if(o)(o.w||o.el).remove();
            const el=document.createElementNS(SVGNS,'image');
            el.setAttribute('draggable','false');el.setAttribute('href',vurl(I.p));
            el.setAttribute('clip-path','url(#ed-'+slug(s.id)+')');
            el.style.mixBlendMode=mode;
            el.style.transition=tr;
            el.style.opacity=opacityOf(s,I);
            let w=null;
            if(an){w=document.createElementNS(SVGNS,'g');const w2=document.createElementNS(SVGNS,'g');w.appendChild(w2);w2.appendChild(el);el.removeAttribute('clip-path');}
            o={k:k,el:el,w:w,tr:tr,m:mode};ovN.set(q.key,o);
          }else{
            if(o.tr!==tr){o.tr=tr;o.el.style.transition=tr;}
            if(o.m!==mode){o.m=mode;o.el.style.mixBlendMode=mode;}
            const v=String(opacityOf(s,I));if(o.el.style.opacity!==v)o.el.style.opacity=v;
          }
          const fs=!an&&P.v!=null&&P.v!=='none'?stById(P.v):null;
          const mk=fs?'url(#ed-'+slug(s.id)+'-'+stIds().get(fs.id)+(!I.follow&&fdMv(s).indexOf(fs)>=0?'-fdm':'-fd')+')':'';
          if(o.mk!==mk){o.mk=mk;o.el.style.mask=mk;}
          const R=imgRect(V),ra={x:f(R.x),y:f(R.y),width:f(R.w),height:f(R.h),preserveAspectRatio:R.par};
          if(o.w)ra.mask='url(#ed-'+slug(s.id)+'-k)';else ra['clip-path']='url(#ed-'+slug(s.id)+(!I.follow&&tfClip(s)?'-m':'')+')';
          for(const a in ra){const v=String(ra[a]);if(o.el.getAttribute(a)!==v)o.el.setAttribute(a,v);}
          keep.add(q.key);
        });
        ovN.forEach((o,k)=>{if(!keep.has(k)){(o.w||o.el).remove();ovN.delete(k);}});
      }else if(ovN.size){ovN.forEach(o=>(o.w||o.el).remove());ovN.clear();}

      const ck=(pvl()?'p':'e')+JSON.stringify([S.styles||0]);
      if(ck!==stLast){stLast=ck;const r=stCanvas();E.stcss.textContent=r.css;E.sdefs.innerHTML=r.defs;}
      const sids=stIds(),bs=blockSel();
      syncKids(gShapes,S.objects.map((s,i)=>{
        if(!onPg(s))return '<g></g>';
        if(isEl(s))return elSvg(s,i,bs);
        if(isCard(s)){const c=centre(s),lk=locked(s);return '<g'+(comm(s)?' class="cm"':'')+'>'+tagOf(s,'class="z cd'+selCls(s,bs)+(lk?' lk':'')+'" data-i="'+i+'"')+
          (cdCfg(s)?'':'<text class="lbl'+(lk?' lk':'')+'" x="'+f(c.x)+'" y="'+(f(c.y)+4)+'">'+esc(s.n||'')+'</text>')+'</g>';}
        if(isLn(s)){
          const c=centre(s),sc=stClass(s),lk=locked(s),d0=lnPathD(lnGeo(s).G0),cv1=lnCv(s);
          return '<g'+(comm(s)?' class="cm"':'')+'><g class="zl zdef zln'+(sc?' '+sc:'')+'">'+lnInner(s,Object.assign({ed:true},cv1))+'</g>'+
            '<g class="z hs ln'+selCls(s,bs)+(lk?' lk':'')+(thruOn(s)?' thru':'')+'" data-i="'+i+'"><path class="lhh" d="'+d0+'" fill="none" stroke="transparent" stroke-width="'+(coarse?22:12)+'" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'+
            '<path d="'+d0+'" fill="none" vector-effect="non-scaling-stroke"/></g>'+
            '<text class="lbl'+(lk?' lk':'')+'" x="'+f(c.x)+'" y="'+(f(c.y)-6)+'">'+esc(s.n||'')+'</text></g>';
        }
        const c=centre(s),sc=stClass(s),hi=hasImg(s),lk=locked(s);
        const lc='zdef'+(hi?' zimg':'')+(sc?' '+sc:''),hs=!!sc||hi,pv=pfVars(s,'ed-');
        return '<g'+(comm(s)?' class="cm"':'')+'>'+tagOf(s,'class="zl '+lc+'"'+(pv?' style="'+esc(pv)+'"':''))+pfTags(s,'ed-')+tagOf(s,'class="z'+(hs?' hs':'')+selCls(s,bs)+(lk?' lk':'')+(thruOn(s)?' thru':'')+'" data-i="'+i+'"')+
          '<text class="lbl'+(lk?' lk':'')+'" x="'+f(c.x)+'" y="'+(f(c.y)+4)+'">'+esc(s.n||'')+'</text></g>';
      }));
      S.objects.forEach((s,i)=>{const fr=gShapes.children[i],d=vHid(s)?'none':'';if(fr&&fr.style.display!==d)fr.style.display=d;});
      let coD='';
      S.objects.forEach((s,i)=>{
        const fr=gShapes.children[i],l=fr&&fr.querySelector(isEl(s)?'.zt,.zi':'.zl');
        if(!l)return;
        const k=isEl(s)?eState(s):zState(s);
        if(l.classList.contains('on')!==(k==='on'))l.classList.toggle('on');
        if(l.classList.contains('un')!==(k==='un'))l.classList.toggle('un');
        if(isEl(s))return;
        const cg=hasImg(s)&&!fillOf(s).c?null:coGrads(s),fl=cg?'url(#ed-co-'+i+')':'';
        if(fl)coD+=coPat(s,cg,'ed-co-'+i,cg.c&&pfStys(s).some(x=>stIds().get(x.id)===cg.c)?pfId(cg.c,s,'ed-'):'ed-grad-'+(cg.c||'zdef')+'-n');
        if((l.getAttribute('data-cf')||'')!==fl){l.setAttribute('data-cf',fl);l.style.fill=fl;}
      });
      const sidsE=stIds(),RMOT=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){return false;}};
      S.objects.forEach((s,i)=>{
        const fr=gShapes.children[i],l=fr&&fr.querySelector(isEl(s)?'.zt,.zi':'.zl');
        if(!l)return;
        const M={},el=isEl(s),pz=!el&&phAll(s).some(I=>I.p);
        evLayersT(s).forEach(({x,g})=>{
          const c=sidsE.get(x.id);
          stDecl(stState(x,'n'),'ed-grad-'+c+'-n','ed-glow-'+c+'-n',el,stUseOf(x)).concat(s.t==='label'?txDecl(x):[]).forEach(d=>{const j=d.indexOf(':');M[d.slice(0,j)]=d.slice(j+1).trim();});
          if(!pvl())return;
          if(stHas(x,'t')){const d=Math.max(0,+x.dur||0);M.transition=d?trList().map(p=>p+' '+d+'ms '+(x.ease||'ease')).join(', '):'none';}
          const sub=anWhole(x)&&(g||pz),k=s.t==='label'?'l':s.t==='icon'?'i':'z',F=sub?'s':'ws';
          if(stHas(x,'a')&&anOf(x,stState(x,'n'),k,null,F)){
            const A=RMOT()?null:anOf(x,stState(x,'n'),k,null,F);
            M.animation=A?'ed-anim-'+c+'-'+k+(sub?'-s':'')+' '+A.sh:'none';
            if(A&&A.tf){M['transform-box']='fill-box';M['transform-origin']=A.og;}
          }
        });
        const bo=bindsOf(s);
        [['op','opacity'],['fc','fill'],['sc','stroke'],['sw','stroke-width'],['fs','font-size'],['ls','letter-spacing']].forEach(q=>{const b=bo.own[q[0]]||bo.grp[q[0]];if(b&&(b.gs||!(q[1] in M)))M[q[1]]=b.val.v;});
        if(soConf(stysOf(s))){const B={};stysOf(s).forEach(x=>{const c=sidsE.get(x.id);
          stDecl(stState(x,'n'),'ed-grad-'+c+'-n','ed-glow-'+c+'-n',el,stUseOf(x)).concat(s.t==='label'?txDecl(x):[]).forEach(d=>{const j=d.indexOf(':');B[d.slice(0,j)]=d.slice(j+1).trim();});});
          Object.keys(B).forEach(k=>{if(!(k in M))M[k]=B[k];});}
        const cf=l.getAttribute('data-cf')||'',sig=Object.keys(M).map(k=>k+':'+M[k]).join(';')+'|'+cf;
        if((l.getAttribute('data-ev')||'')!==sig){
          l.setAttribute('data-ev',sig);
          (l._evk||[]).forEach(k=>l.style.removeProperty(k));
          Object.keys(M).forEach(k=>l.style.setProperty(k,M[k]));
          if(!M.fill&&cf)l.style.fill=cf;
          l._evk=Object.keys(M);
        }
        if(!el)hitMv(fr.querySelector('[data-i]'),M);
      });
      if(coD!==lastCo){lastCo=coD;gCo.innerHTML=coD;}
      tfCanvas();
      pgCanvas();
      imgs.forEach(q=>{
        const o=ovN.get(q.key),fr=gShapes.children[S.objects.indexOf(q.s)],n=o&&(o.w||o.el);
        if(n&&fr&&n.parentNode!==fr)fr.insertBefore(n,fr.firstChild);
      });

      let ov='';
      const hr=f((coarse?4.5:2.75)/zoom),hr2=f((coarse?3.5:2)/zoom),hit=f((coarse?12:6)/zoom);
      const HIT=(attr,x,y)=>'<circle class="hh" '+attr+' cx="'+f(x)+'" cy="'+f(y)+'" r="'+hit+'"/>';
      const hs0=!flow&&sel>=0&&S.objects[sel]&&!locked(S.objects[sel])&&!vHid(S.objects[sel])?S.objects[sel]:null;
      if(hs0&&isEl(hs0)&&!lblTx(hs0).fs){
        const s=S.objects[sel],p0=posOf(s);
        const sz=s.size||(s.t==='label'?18:28);
        const lx=s.t==='label'?0:sz/2,ly=s.t==='label'?sz*0.8:sz/2,M=elMat(s);
        const hx=M[0]*lx+M[2]*ly,hy=M[1]*lx+M[3]*ly;
        ov+='<circle class="hd" cx="'+f(p0.x+hx)+'" cy="'+f(p0.y+hy)+'" r="'+hr+'"/>'+HIT('data-h="sz"',p0.x+hx,p0.y+hy);
      }
      if(hs0&&!isEl(hs0)){
        const s=S.objects[sel];
        const H=(h,x,y,r)=>'<circle class="hd" cx="'+f(x)+'" cy="'+f(y)+'" r="'+(r||hr)+'"/>'+HIT('data-h="'+h+'"',x,y);
        const C=(x,y)=>H('mv',x,y,hr2);
        if(s.t==='poly'||s.t==='line'){
          const J=vsOf();
          const ha=hr*1.4;
          ov+=ptMids(s).map(m=>'<circle class="hd hmb" cx="'+f(m.x)+'" cy="'+f(m.y)+'" r="'+f(ha*1.15)+'"/><path class="hd hm" d="M'+
            f(m.x-ha)+','+f(m.y)+'H'+f(m.x+ha)+'M'+f(m.x)+','+f(m.y-ha)+'V'+f(m.y+ha)+'"/>'+HIT('data-vm="'+m.i+'"',m.x,m.y)).join('');
          ov+=s.p.map((q,j)=>{const c=J.indexOf(j)>=0?'hd tp':'hd';return (ptCurve(s,q)
            ?'<circle class="'+c+'" cx="'+f(q.x)+'" cy="'+f(q.y)+'" r="'+hr+'"/>'
            :'<rect class="'+c+'" x="'+f(q.x-hr)+'" y="'+f(q.y-hr)+'" width="'+f(hr*2)+'" height="'+f(hr*2)+'"/>')+HIT('data-v="'+j+'"',q.x,q.y);}).join('');
        }
        else if(s.t==='reg'){
          const v=ptsOf(s)[0];
          ov+=H('reg',v.x,v.y)+C(s.cx,s.cy);
        }
        else if(s.t==='rect'||s.t==='callout'||s.t==='card'){
          if(s.t==='callout'&&s.body==='line')ov+=s.lo==='v'?H('n',s.x,s.y)+H('s',s.x,s.y+s.h):H('w',s.x,s.y)+H('e',s.x+s.w,s.y);
          else ov+=H('nw',s.x,s.y)+H('ne',s.x+s.w,s.y)+H('se',s.x+s.w,s.y+s.h)+H('sw',s.x,s.y+s.h)+
              H('n',s.x+s.w/2,s.y)+H('e',s.x+s.w,s.y+s.h/2)+H('s',s.x+s.w/2,s.y+s.h)+H('w',s.x,s.y+s.h/2);
          if(s.t==='callout'){
            const g=coInfo(s),SQ=(h,q)=>'<rect class="hd" x="'+f(q.x-hr)+'" y="'+f(q.y-hr)+'" width="'+f(hr*2)+'" height="'+f(hr*2)+'"/>'+HIT('data-h="'+h+'"',q.x,q.y);
            if(!g.ell&&!g.ln){const m=Math.max(Math.min(g.R,g.w/2,g.h/2),(coarse?16:10)/zoom);ov+=H('ccr',g.x+m,g.y+m,hr2);}
            if(!g.inside){
              if(g.tail==='wedge'||g.tail==='curved')ov+=SQ('cb0',g.e0)+SQ('cb1',g.e1);
              else ov+=SQ('cbc',g.c);
              if(g.tail==='curved'){
                const o=coBend(g,s);
                ov+='<circle class="hd bd" cx="'+f((g.c.x+g.tip.x)/2+o.x/2)+'" cy="'+f((g.c.y+g.tip.y)/2+o.y/2)+'" r="'+hr+'"/>'+
                    HIT('data-h="cbd"',(g.c.x+g.tip.x)/2+o.x/2,(g.c.y+g.tip.y)/2+o.y/2);
              }
            }
            const t=g.tip,k=hr*1.7;
            ov+='<path class="hd tp" d="M'+f(t.x)+','+f(t.y-k)+' L'+f(t.x+k)+','+f(t.y)+' L'+f(t.x)+','+f(t.y+k)+' L'+f(t.x-k)+','+f(t.y)+' Z"/>'+HIT('data-h="ctp"',t.x,t.y);
          }
        }
        else if(s.t==='circle'){
          ov+=H('rr',s.cx+s.rr,s.cy)+C(s.cx,s.cy);
        }
        else{
          const R=a=>a*Math.PI/180,P=(r,a)=>({x:s.cx+r*Math.cos(R(a)),y:s.cy+r*Math.sin(R(a))});
          const am=(s.a0+s.a1)/2,rm=(s.r1+s.r2)/2;
          const o=P(s.r2,am),i=P(s.r1,am),e0=P(rm,s.a0),e1=P(rm,s.a1);
          ov+=H('r2',o.x,o.y)+H('r1',i.x,i.y)+H('a0',e0.x,e0.y)+H('a1',e1.x,e1.y)+C(s.cx,s.cy);
        }
      }
      if(!flow&&S.groups.length){
        S.groups.forEach(G=>{
          const m=members(G.id).filter(s=>!vHid(s)),inn=G.id===gIn,on=!inn&&bs.has(G.id),hov=!inn&&!on&&G.id===hovG&&tool==='select';
          if(!m.length||(!inn&&!on&&!hov))return;
          const b=bboxOf(m);if(!isFinite(b.x0))return;
          ov+='<rect class="gbx'+(inn?' in':on?' on':' hov')+'" x="'+f(b.x0)+'" y="'+f(b.y0)+'" width="'+f(b.x1-b.x0)+'" height="'+f(b.y1-b.y0)+'"/>';
        });
      }
      if(draft&&!flow){
        if((draft.t==='poly'||draft.t==='line')&&draft.p.length)ov+='<path class="gd" d="M'+draft.p.map(q=>f(q.x)+','+f(q.y)).join(' L')+(draft.c?' L'+f(draft.c.x)+','+f(draft.c.y):'')+'"/>';
        if(draft.t==='rect'||draft.t==='callout'||draft.t==='card')ov+='<rect class="gd" x="'+f(Math.min(draft.a.x,draft.c.x))+'" y="'+f(Math.min(draft.a.y,draft.c.y))+'" width="'+f(Math.abs(draft.c.x-draft.a.x))+'" height="'+f(Math.abs(draft.c.y-draft.a.y))+'"/>';
        if(draft.t==='reg'){
          const r=Math.hypot(draft.c.x-draft.a.x,draft.c.y-draft.a.y);
          const rot=Math.atan2(draft.c.y-draft.a.y,draft.c.x-draft.a.x);
          if(r>2)ov+='<path class="gd" d="'+roundPoly(regular(draft.a.x,draft.a.y,r,sidesN(),rot),0)+'"/>';
        }
        if(draft.t==='circle'||draft.t==='ring')ov+='<circle class="gd" cx="'+f(draft.a.x)+'" cy="'+f(draft.a.y)+'" r="'+f(Math.hypot(draft.c.x-draft.a.x,draft.c.y-draft.a.y))+'"/>';
      }
      const showSnap=!flow&&(drag||draft||gdrag||(tool!=='select'&&tool!=='hand'));
      cv.classList.toggle('drawing',tool!=='select'&&tool!=='hand');
      cv.classList.toggle('hand',tool==='hand');
      gGd.classList.toggle('locked',glock);
      gGd.style.display=gOn()?'':'none';
      if(gOn()){
        const hot=showSnap?guides.filter(g=>g.fx!=null).map(g=>g.fx):[];
        put(gGd,(S.guides||[]).map((g,i)=>{
          const d=g.v?'M'+f(g.c)+',0 V'+S.h:'M0,'+f(g.c)+' H'+S.w;
          return '<g class="'+(g.v?'gv':'gh')+(i===selG?' gsel':'')+(hot.indexOf(i)>=0?' ghot':'')+'">'+
            '<path class="gl" d="'+d+'"/></g>';
        }).join(''));
      }
      if(guides.length&&showSnap){
        const ext=10/zoom,rd=f(2.5/zoom);
        guides.forEach(g=>{
          if(g.fx!=null)return;
          const a=Math.min(g.p,g.q)-ext,b=Math.max(g.p,g.q)+ext;
          ov+=g.v
            ?'<path class="guide" d="M'+f(g.c)+','+f(a)+' V'+f(b)+'"/><circle class="guidep" cx="'+f(g.c)+'" cy="'+f(g.q)+'" r="'+rd+'"/>'
            :'<path class="guide" d="M'+f(a)+','+f(g.c)+' H'+f(b)+'"/><circle class="guidep" cx="'+f(g.q)+'" cy="'+f(g.c)+'" r="'+rd+'"/>';
        });
      }
      if(snapped&&showSnap){
        const x=f(snapped.x),y=f(snapped.y),r=5/zoom;
        ov+=snapped.k==='v'
          ?'<circle class="snapv" cx="'+x+'" cy="'+y+'" r="'+f(7/zoom)+'"/>'
          :'<path class="snapg" d="M'+f(snapped.x-r)+','+y+' H'+f(snapped.x+r)+' M'+x+','+f(snapped.y-r)+' V'+f(snapped.y+r)+'"/>';
      }
      if(hasPgs()&&!pvl()&&selBg&&selPg){
        const A=pgA(pgOf(cpg())),r='x="'+A.x+'" y="'+A.y+'" width="'+A.w+'" height="'+A.h+'"',k=1/zoom,n=pgName(pgOf(cpg()));
        const th=f(18*k),tw=f((n.length*6.6+14)*k);
        ov='<g class="pga"><rect class="pgo" '+r+'/><rect class="pgi" '+r+'/>'+
          '<rect class="pgt" x="'+A.x+'" y="'+f(A.y-18*k)+'" width="'+tw+'" height="'+th+'" rx="'+f(3*k)+'"/>'+
          '<text x="'+f(A.x+7*k)+'" y="'+f(A.y-5.5*k)+'" font-size="'+f(11*k)+'">'+esc(n)+'</text></g>'+ov;
      }
      if(hs0&&isCard(hs0))ov='<rect class="gbx on" x="'+f(hs0.x)+'" y="'+f(hs0.y)+'" width="'+f(hs0.w)+'" height="'+f(hs0.h)+'"/>'+ov;
      ov+=twOv();
      put(gOv,ov);
      cdDraw();
      if(flow)flReq();
      rulersReq();
    }

    function panels(){
      if(!GM)return giro(panels);
      resel();
      if(ms.length)selBg=false;
      if(ms.length||selBg||selSt||selRu||!S.guides[selG])selG=-1;
      if(selRu&&ruCur&&!ruleOf(ruCur)&&!causeOf(ruCur))ruCur='';
      if(!selSt||flow||SGR().indexOf(stGrpCur)<0)stGrpCur='';
      if(selSt&&(!stById(stCur)||isAn(stById(stCur))!==stAn)){const x=stSorted().find(q=>isAn(q)===stAn);stCur=x?x.id:0;}
      if(selSt&&(ms.length!==stMs.length||ms.some((q,k)=>q!==stMs[k]))){
        const ids=new Set();ms.forEach(q=>{stysOf(q).forEach(x=>{if(isAn(x)===stAn)ids.add(x.id);});});
        if(ids.size===1){const id=[...ids][0];if(id!==stCur){stCur=id;stGrpCur='';}}
      }
      stMs=ms.slice();
      const top=selSt||selRu||selTe,lt=selSt?(stAn?'a':'s'):selRu?'r':selTe?'t':'p';
      const selProj=!top&&!ms.length&&!selBg&&selG<0;
      E.ltab.querySelectorAll('[data-tab]').forEach(b=>{const v=String(b.dataset.tab===lt);if(b.getAttribute('aria-selected')!==v)b.setAttribute('aria-selected',v);});
      E.ibar.hidden=top;E.sbar.hidden=!selSt;sbarNames();E.rbar.hidden=!selRu;E.tbar.hidden=!(selTe&&!selSt&&!selRu);
      {const tb=E.tbar.querySelector('[data-tb]'),x=!S.sim&&!S.clk;if(tb.disabled!==x)tb.disabled=x;}
      {const n=Object.keys(SIM()).length,fr=E.flreal.firstElementChild,t='Release values · '+n,hd=!(n>0||S.clk);
        if(fr.textContent!==t)fr.textContent=t;if(E.flreal.hidden!==hd)E.flreal.hidden=hd;}
      let rows='',open=[];
      const fd=fold();
      let sec='';
      for(let i=S.objects.length-1;i>=0;i--){
        const s=S.objects[i],ch=chainOf(s).slice().reverse();
        if(!onPg(s))continue;
        if(hasPgs()){const k=comm(s)?'c':'p';if(k!==sec){sec=k;open=[];rows+='<p class="pgsec">'+(k==='c'?'all pages':esc(pgName(pgOf(cpg()))))+'</p>';}}
        let k=0;while(k<open.length&&k<ch.length&&open[k]===ch[k])k++;
        open=ch.slice(0,k);
        for(let j=k;j<ch.length;j++){
          const id=ch[j];open.push(id);
          if(ch.slice(0,j).some(x=>fd.has(x)))continue;
          const G=grpOf(id),m=members(id),cl=fd.has(id);
          const on=selGrp===id,part=!on&&m.some(isSel);
          const hv=hidS().has(id),hb=!hv&&ch.slice(0,j).some(x=>hidS().has(x));
          rows+='<div data-gr="'+id+'" data-dep="'+j+'" class="grh'+(on?' on':part?' part':'')+(hv||hb?' vh':'')+'"'+indent(j)+'>'+
            lkBtn('g'+id,!!(G&&G.lk),!(G&&G.lk)&&ch.slice(0,j).some(grpLk))+ehBtn('g'+id,hv,hb)+evBadge(G,id)+
            '<span class="fold" data-fold="'+id+'" title="'+(cl?'Expand':'Collapse')+'">'+(cl?'▸':'▾')+'</span>'+
            esc((G&&G.n)||'(unnamed)')+'<span class="gc">'+m.length+'</span></div>';
        }
        if(ch.some(x=>fd.has(x)))continue;
        const hv=hidS().has(s.id),hb=!hv&&hidOn(s);
        rows+='<div data-i="'+i+'" data-dep="'+ch.length+'" class="'+(ch.length?'in':'')+(isSel(s)?' on':'')+(hv||hb?' vh':'')+'"'+indent(ch.length)+'>'+lkBtn('i'+i,!!s.lk,!s.lk&&locked(s))+ehBtn('i'+i,hv,hb)+evBadge(s)+(isEl(s)?(s.t==='label'?'T ':'★ '):isCard(s)?'▭ ':s.t==='line'?'╱ ':'')+esc(s.n||'(unnamed)')+(hasImg(s)?' ·':'')+'</div>';
      }
      if(selSt)put(E.list,stRows());
      else if(selRu)put(E.list,ruRows());
      else if(selTe)put(E.list,teRows());
      else put(E.list,
        '<div data-proj="1" class="pin'+(selProj?' on':'')+'">⚙ project · '+S.w+'×'+S.h+'</div>'+
        '<div data-bg="1" class="pin'+(selBg&&!selPg?' on':'')+'">▣ background · '+(BGS().length?BGS().length+(BGS().length===1?' layer':' layers'):'none')+'</div>'+
        (hasPgs()?'<div data-pg="1" class="pin'+(selBg&&selPg?' on':'')+'">▭ '+esc(pgName(pgOf(cpg())))+' · '+pgA(pgOf(cpg())).w+'×'+pgA(pgOf(cpg())).h+'</div>':'')+
        (rows||'<p class="hint" style="margin:6px">No objects</p>'));
      const one=sel>=0&&S.objects[sel];
      const hid=ch=>ch.slice().reverse().find(x=>fold().has(x));
      let shown='';
      if(selGrp!=null){const h=hid(chainG(gpar(selGrp)));shown='g'+(h!=null?h:selGrp);}
      else if(one){const h=hid(chainOf(one));shown=h!=null?'g'+h:'i'+sel;}
      if(selSt)shown='s'+stCur;
      if(selRu)shown='u'+ruCur;
      if(shown&&shown!==lastShown){
        const r=E.list.querySelector(shown[0]==='u'?'[data-ru="'+ruCur+'"],[data-ca="'+ruCur+'"]':shown[0]==='s'?'[data-sr="'+stCur+'"]':shown[0]==='g'?'[data-gr="'+shown.slice(1)+'"]':'[data-i="'+sel+'"]');
        if(r){const L=E.list,t=r.offsetTop,b=t+r.offsetHeight;
          if(t<L.scrollTop)L.scrollTop=t-4;else if(b>L.scrollTop+L.clientHeight)L.scrollTop=b-L.clientHeight+4;}
      }
      lastShown=shown;
      E.insp.style.display=ms.length&&!top?'':'none';
      if(!hasPgs())selPg=false;
      E.bgpanel.style.display=selBg&&!selPg&&!top?'':'none';
      if(selBg&&!selPg&&!top)blPanel();
      E.pgpanel.style.display=selBg&&selPg&&!top?'':'none';
      if(selBg&&selPg&&!top)pgPanel();
      pgBar();
      E.stpanel.style.display=selSt?'':'none';
      if(selSt)stPanel();
      E.rupanel.style.display=selRu?'':'none';
      {const te=selTe&&!selSt&&!selRu&&!!teCur;E.tepanel.style.display=te?'':'none';if(te)tePanel();}
      if(selRu)ruPanel();
      E.projpanel.style.display=selProj?'':'none';
      if(selProj)pgSzPanel();
      E.gpanel.style.display=selG>=0&&!top?'':'none';
      if(selG>=0){
        const g=S.guides[selG],t=g.v?'Vertical guide (x)':'Horizontal guide (y)';
        if(E.gtit.textContent!==t)E.gtit.textContent=t;
        if(E.gpos!==root.activeElement)E.gpos.value=f(g.c);
        const n=gLinkedN(g),at=n?n+(n===1?' item attached':' items attached'):'No items attached';
        const ga=$('#gatt'),gd=$('#gdet');
        if(ga.textContent!==at)ga.textContent=at;
        gd.style.display=n?'':'none';
      }
      const s=selGrp!=null?'grp:'+selGrp:ms.length>1?'multi:'+ms.length:(sel>=0&&S.objects[sel]||null);
      if(s!==inspObj){inspObj=s;inspector();vsRow();iszRefresh();bhPanel();lvPanel();}
      else{syncFields();insRefresh();grpRefresh();styRefresh();bhPanel();lvPanel();}
      ibarRefresh();sbarRefresh();rbarRefresh();xfRefresh();
      if(flow){
        if(selRu&&ruCur!==flRu){flRu=ruCur;flFoc=ruleOf(ruCur)?{k:'r',id:ruCur}:causeOf(ruCur)?{k:'c',id:ruCur}:null;flMenu=null;}
        flCols();
      }
      flDock();
      if(!PK.el.hidden&&(!PK.field||!PK.field.isConnected||!PK.field.offsetParent))pickClose();
      marks();
      if(drawerOpen)queueOut();
    }

    function selCls(s,bs){
      if(flow)return '';
      const b=chainOf(s).some(id=>bs.has(id));
      return (isSel(s)&&!b?' sel':'')+(b?' gs':'')+(unitG(s)?' gm':'');
    }
    const LIND=20;
    function indent(d){return d>0?' style="padding-left:'+(8+LIND*d)+'px"':'';}
    function lkBtn(k,on,inh){
      const t=on?'Unlock':inh?'Locked by group':'Lock';
      return '<span class="lkb'+(on?' on':inh?' inh':'')+'" data-lkb="'+k+'" role="button" title="'+t+'" aria-label="'+t+'" aria-pressed="'+on+'">'+lkIcon(on||inh)+'</span>';
    }
    function ehBtn(k,on,inh){
      const t=on?'Show':inh?'Hidden by group':'Hide';
      return '<span class="lkb'+(on?' on':inh?' inh':'')+'" data-ehb="'+k+'" role="button" title="'+t+'" aria-label="'+t+'" aria-pressed="'+on+'">'+
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(on||inh?EYC:EYO)+'"/></svg></span>';
    }
    function elSvg(s,i,bs){
      const p0=posOf(s);
      const ec=elCls(s),col='#8792A4';
      const paint=' class="'+(s.t==='label'?'zt ':'zi ')+ec+'"';
      const mark=selCls(s,bs||blockSel())+(locked(s)?' lk':'');
      const pv=pfVars(s,'ed-'),pfSty=pv?esc('; '+pv):'';
      let body='',w,hh,al;
      if(s.t==='label'){
        const ft=folNow(s,'text'),txt=ft!=null?ft:decoLabel(s)?freeTxt(s):(pvl()?(folRule(s,'text')?'—':''):'text');
        const tx=lblTx(s),sz=tx.fs||s.size||18;
        w=Math.max(20,txt.length*(sz*(tx.up?0.7:0.6)+(tx.ls||0)));hh=sz*1.4;
        al=tx.ta;
        body='<text x="'+f(p0.x)+'" y="'+f(p0.y)+'" font-size="'+sz+'"'+paint+
             ' text-anchor="middle" dominant-baseline="middle" style="pointer-events:none'+pfSty+'">'+esc(txt)+'</text>';
      }else{
        const sz=s.size||28,k=sz/24;
        const d=iconPath(symNow(s));
        w=sz;hh=sz;
        body=d
          ?'<g transform="translate('+f(p0.x-sz/2)+','+f(p0.y-sz/2)+') scale('+f(k)+')"><g'+paint+' style="pointer-events:none'+pfSty+'"><path d="'+d+'"/></g></g>'
          :'<circle cx="'+f(p0.x)+'" cy="'+f(p0.y)+'" r="'+f(sz/2)+'" fill="none" stroke="'+col+'" stroke-dasharray="3 2" style="pointer-events:none"/>';
      }
      const ax=al==='start'?0:al==='end'?-w:-w/2,et=elTr(s,p0);
      return '<g class="el'+mark+(comm(s)?' cm':'')+'" data-i="'+i+'">'+(et?'<g'+et+'>':'')+
        '<rect class="hit" x="'+f(p0.x+ax)+'" y="'+f(p0.y-hh/2)+'" width="'+f(w)+'" height="'+f(hh)+'" fill="transparent"/>'+
        body+(et?'</g>':'')+pfTags(s,'ed-')+'</g>';
    }

    const clampZ=z=>Math.min(12,Math.max(.08,z));
    function setZoom(z,ax,ay){
      if(zFit)zFitSet(false);
      const old=zoom,r=cv.getBoundingClientRect();
      let ox,oy;
      if(ax!=null){ox=(ax-r.left)/old;oy=(ay-r.top)/old;}
      zoom=clampZ(z);draw();
      if(ax!=null){const r2=cv.getBoundingClientRect();
        stage.scrollLeft+=(r2.left+ox*zoom)-ax;stage.scrollTop+=(r2.top+oy*zoom)-ay;}
    }
    function fitZ(){
      const [sw,sh]=stSz||[stage.clientWidth,stage.clientHeight],w=sw-40,h=sh-40;
      return w>0&&h>0?clampZ(Math.min(w/S.w,h/S.h)):0;
    }
    function fit(){
      if(stage.clientWidth>0)stSz=[stage.clientWidth,stage.clientHeight];
      const z=fitZ();if(z)zoom=z;
      render();
    }
    try{zFit=localStorage.getItem(KEY+'-zfit')==='1';}catch(_){}
    const zfB=$('#zf button');zfB.setAttribute('aria-pressed',zFit);
    function zFitSet(v){
      zFit=v;zfB.setAttribute('aria-pressed',v);
      try{localStorage.setItem(KEY+'-zfit',v?'1':'0');}catch(_){}
      if(v&&S)draw();
    }
    zfB.addEventListener('click',()=>zFitSet(!zFit));
    if(window.ResizeObserver)new ResizeObserver(()=>{
      stSz=[stage.clientWidth,stage.clientHeight];
      if(zFit&&S)draw();
    }).observe(stage);
    $('#zc').addEventListener('click',e=>{
      const b=e.target.closest('[data-z]');if(!b)return;const z=b.dataset.z;
      const r=stage.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      if(z==='1')return setZoom(1,cx,cy);
      setZoom(zoom*(z==='+'?1.25:.8),cx,cy);
    });
    stage.addEventListener('wheel',e=>{
      if(!(e.ctrlKey||e.metaKey))return;
      e.preventDefault();setZoom(zoom*(e.deltaY<0?1.1:1/1.1),e.clientX,e.clientY);
    },{passive:false});

    const act=new Map();let gest=null,pan=null,spaceDown=false;
    const TAP=coarse?10:6;
    function spaceUp(){if(!spaceDown)return;spaceDown=false;cv.classList.remove('space');}
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
    function startGesture(){
      const v=[...act.values()];
      gest={d:dist(v[0],v[1]),m:mid(v[0],v[1]),z:zoom};
      if(draft&&isPD(draft)&&draft.pid!=null&&act.has(draft.pid)){draft.pid=null;undoPoint();}
      drag=null;pan=null;if(draft&&!isPD(draft))draft=null;render();
    }
    function runGesture(){
      const v=[...act.values()],d=dist(v[0],v[1]),m=mid(v[0],v[1]);
      if(gest.d>0)setZoom(gest.z*(d/gest.d),m.x,m.y);
      stage.scrollLeft-=m.x-gest.m.x;stage.scrollTop-=m.y-gest.m.y;
      gest.m=m;gest.d=d;gest.z=zoom;
    }
    function grab(e,d){
      d.sx=e.clientX;d.sy=e.clientY;d.live=false;d.done={x:0,y:0};
      if(d.k==='m'){
        const hit=d.hit||S.objects[sel],list=ms.length?ms:[hit];
        d.set=movers(list);
        d.own=ownPts(list,hit);
        d.anc=anchorsEx(list);
      }else d.anc=anchors(sel);
      cv.setPointerCapture(e.pointerId);
      return d;
    }
    function selUnder(p){
      for(let k=S.objects.length-1;k>=0;k--){
        const s=S.objects[k];
        if(!isSel(s)||locked(s)||vHid(s)||!unitFor(s,false).unit.every(isSel))continue;
        const g=gShapes.querySelector('[data-i="'+k+'"]');if(!g)continue;
        if(isEl(s)){
          const r=g.querySelector('rect.hit');if(!r)continue;
          const p0=posOf(s),M=elMat(s),dx=p.x-p0.x,dy=p.y-p0.y;
          const lx=p0.x+M[0]*dx+M[1]*dy,ly=p0.y+M[2]*dx+M[3]*dy;
          const x=+r.getAttribute('x'),y=+r.getAttribute('y'),w=+r.getAttribute('width'),h=+r.getAttribute('height');
          if(lx>=x&&lx<=x+w&&ly>=y&&ly<=y+h)return s;
        }else if(typeof g.isPointInFill==='function'){
          try{if(g.isPointInFill(new DOMPoint(p.x,p.y)))return s;}catch(_){}
        }
      }
      return null;
    }
    cv.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0&&e.button!==1)return;
      if(e.isPrimary)act.clear();
      settle();
      act.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(act.size===2)return startGesture();
      if(act.size>2)return;
      if(!draft)gHitReset();
      if(e.button===1){pan={x:e.clientX,y:e.clientY,moved:0};cv.setPointerCapture(e.pointerId);e.preventDefault();return;}
      if(spaceDown||tool==='hand'){pan={x:e.clientX,y:e.clientY,moved:0};cv.setPointerCapture(e.pointerId);return;}
      const p=pt(e);
      const hitEl=e.target.closest?e.target.closest('[data-i]'):null;
      if(TW){pan={x:e.clientX,y:e.clientY,moved:0,tw:hitEl?+hitEl.dataset.i:-1};cv.setPointerCapture(e.pointerId);return;}
      if(flow){
        pan={x:e.clientX,y:e.clientY,moved:0,fo:hitEl?+hitEl.dataset.i:-1};cv.setPointerCapture(e.pointerId);
        const so=flCv&&pan.fo>=0?S.objects[pan.fo]:null;
        if(so&&gstSw(so))pan.sw={x:e.clientX,y:e.clientY,t:performance.now()};
        return;
      }
      if(tool==='select'){
        const v=e.target.dataset.v,vm=e.target.dataset.vm,hh=e.target.dataset.h,ps=S.objects[sel];
        if(v!==undefined&&ps&&ps.p){
          const j=+v,J=vsOf();
          if(e.altKey){if(ps.p.length>ptMin(ps)){settle();ps.p.splice(j,1);vsSet(ps,J.filter(i=>i!==j).map(i=>i>j?i-1:i));render();store(true);}return;}
          if(e.shiftKey){vsSet(ps,J.indexOf(j)>=0?J.filter(i=>i!==j):J.concat([j]));render();return;}
          const L=J.indexOf(j)>=0?J:[j];vsSet(ps,L);
          drag=grab(e,{k:'v',j:j,js:L,o0:L.map(i=>({x:ps.p[i].x,y:ps.p[i].y}))});render();return;
        }
        if(vm!==undefined&&ps&&ps.p){
          settle();const j=ptAdd(ps,+vm);if(j<0)return;vsSet(ps,[j]);
          drag=grab(e,{k:'v',j:j,js:[j],o0:[{x:ps.p[j].x,y:ps.p[j].y}]});render();return;
        }
        vsel=null;
        if(hh==='mv'){drag=grab(e,{k:'m',from:p});return;}
        if(hh!==undefined){drag=grab(e,{k:'h',h:hh,from:p,r0:(S.objects[sel]&&S.objects[sel].r)||0});return;}
        const i=hitEl?hitEl.dataset.i:undefined;
        if(i!==undefined){
          let s=S.objects[+i];
          const direct=e.ctrlKey||e.metaKey,add=e.shiftKey,mod=direct||add;
          let U=unitFor(s,direct);
          if(!mod&&!msel&&!U.unit.every(isSel)){const s2=selUnder(p);if(s2){s=s2;U=unitFor(s2,false);}}
          const unit=U.unit,ug=U.ug;
          if(mod||!unit.every(isSel)){
            pan={x:e.clientX,y:e.clientY,moved:0,tap:{s:s,unit:unit,ug:ug,ctx:U.ctx,add:add||msel,direct:direct}};
            cv.setPointerCapture(e.pointerId);return;
          }
          const grp=ms.length>unit.length;
          if(!grp)pickG(unit,ug);
          const body=e.altKey&&!grp&&unit.length===1&&s.t==='callout';
          drag=grab(e,{k:'m',from:p,grp:grp,hit:s,unit:unit,ug:ug,body:body,msel:msel});render();
        }
        else{pan={x:e.clientX,y:e.clientY,moved:0,deselect:true};cv.setPointerCapture(e.pointerId);}
        return;
      }
      const anc=anchors(-1),q0=snap2(p,-1,anc),q={x:iv(q0.x),y:iv(q0.y)};
      if(tool==='label'){add({t:'label',x:q.x,y:q.y,size:18});setTool('select');return;}
      if(tool==='icon'){add({t:'icon',x:q.x,y:q.y,size:28,icon:'mdi:lightbulb'});setTool('select');return;}
      if(tool==='reg'){draft={t:'reg',a:q,c:q,anc:anc};cv.setPointerCapture(e.pointerId);render();return;}
      if(tool==='poly'||tool==='line'){
        if(!draft)draft={t:tool,p:[q],c:q,anc:anc};
        else{const a=draft.p[0],z=draft.p[draft.p.length-1],nr=b=>dist({x:b.x*zoom,y:b.y*zoom},{x:q.x*zoom,y:q.y*zoom})<(coarse?22:12);
          if(tool==='poly'&&draft.p.length>2&&nr(a))return commitPoly();
          if(tool==='line'&&nr(z)){if(draft.p.length>=2)return commitPoly();return;}
          draft.p.push(q);}
        draft.pid=e.pointerId;
        render();return;
      }
      draft={t:tool,a:q,c:q,anc:anc};cv.setPointerCapture(e.pointerId);render();
    });
    cv.addEventListener('pointermove',e=>{
      if(act.has(e.pointerId))act.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(gest&&act.size>=2){e.preventDefault();return runGesture();}
      if(e.pointerType==='mouse'&&!e.buttons&&(drag||pan||gdrag))return endPointer(e);
      if(gdrag)return guideMove(e);
      if(pan){
        pan.moved+=Math.abs(e.clientX-pan.x)+Math.abs(e.clientY-pan.y);
        if(pan.sw){pan.x=e.clientX;pan.y=e.clientY;return;}
        if(pan.moved>=TAP&&!cv.classList.contains('panning'))cv.classList.add('panning');
        stage.scrollLeft-=e.clientX-pan.x;stage.scrollTop-=e.clientY-pan.y;
        pan.x=e.clientX;pan.y=e.clientY;return;
      }
      if(flow)return;
      if(drag&&(sel>=0||drag.set)){
        const p=pt(e),s=S.objects[sel];
        if(!s&&!drag.set){drag=null;return;}
        if(!drag.live){
          if(Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)<(coarse?8:4))return;
          drag.live=true;
        }
        if(drag.k==='m'){
          const t0=snapMove(drag.own,{x:p.x-drag.from.x,y:p.y-drag.from.y},drag.anc),t={x:iv(t0.x),y:iv(t0.y)};
          drag.set.forEach(q=>move(q,t.x-drag.done.x,t.y-drag.done.y,drag.body));drag.done=t;
        }
        else if(drag.k==='v'){
          const q=snap2(p,sel,drag.anc),b=drag.o0[drag.js.indexOf(drag.j)],dx=iv(q.x)-b.x,dy=iv(q.y)-b.y;
          drag.js.forEach((i,n)=>{if(s.p[i])s.p[i]=Object.assign({},s.p[i],{x:drag.o0[n].x+dx,y:drag.o0[n].y+dy});});
        }
        else if(s.t==='callout'&&drag.h.charAt(0)==='c'){coDrag(s,drag,p,e);intS(s);}
        else{
          const h=drag.h;
          const q=(isEl(s)||s.t==='ring')?(unsnap(),p):snap2(p,sel,drag.anc);
          if(isEl(s)){
            const p0=posOf(s),M=elMat(s),dx=p.x-p0.x,dy=p.y-p0.y,lx=M[0]*dx+M[1]*dy,ly=M[2]*dx+M[3]*dy;
            if(s.t==='label')s.size=Math.max(6,Math.round(Math.abs(ly)/0.8));
            else s.size=Math.max(8,Math.round(Math.max(Math.abs(lx),Math.abs(ly))*2));
          }else if(s.t==='reg'){
            s.rr=Math.max(3,Math.hypot(q.x-s.cx,q.y-s.cy));
            let a=Math.atan2(q.y-s.cy,q.x-s.cx)*180/Math.PI;
            if(e.shiftKey){a=Math.round(a/15)*15;unsnap();}
            s.rot=a;
          }else if(s.t==='rect'||s.t==='callout'||s.t==='card'){
            const x2=s.x+s.w,y2=s.y+s.h;
            if(h.indexOf('w')>=0){s.w=x2-q.x;s.x=q.x;}
            if(h.indexOf('e')>=0){s.w=q.x-s.x;}
            if(h.indexOf('n')>=0){s.h=y2-q.y;s.y=q.y;}
            if(h.indexOf('s')>=0){s.h=q.y-s.y;}
            const ln=s.t==='callout'&&s.body==='line';
            if(!(ln&&s.lo==='v')&&s.w<2)s.w=2;
            if(!(ln&&s.lo!=='v')&&s.h<2)s.h=2;
          }else if(s.t==='circle'){
            s.rr=Math.max(2,Math.hypot(q.x-s.cx,q.y-s.cy));
          }else{
            const d=Math.hypot(p.x-s.cx,p.y-s.cy);
            if(h==='r2')s.r2=Math.max(s.r1+2,d);
            else if(h==='r1')s.r1=Math.max(0,Math.min(s.r2-2,d));
            else{
              let a=Math.atan2(p.y-s.cy,p.x-s.cx)*180/Math.PI;
              const cur=h==='a0'?s.a0:s.a1;
              while(a-cur>180)a-=360; while(cur-a>180)a+=360;
              a=Math.round(a);
              if(h==='a0')s.a0=Math.min(a,s.a1-2); else s.a1=Math.max(a,s.a0+2);
            }
          }
          intS(s);
        }
        req();store();return;
      }
      if(draft){const q=snap2(pt(e),-1,draft.anc);draft.c={x:iv(q.x),y:iv(q.y)};req();}
      else if(tool!=='select'&&tool!=='hand'&&!drag){const had=snapped||guides.length;snap2(pt(e),-1);if(had||snapped||guides.length)req();}
    });
    cv.addEventListener('pointerleave',()=>{hover(null);if(!drag&&!draft&&(snapped||guides.length)){unsnap();req();}});
    function coDrag(s,d,p,e){
      const h=d.h,g=coInfo(s);
      if(h==='ctp'){
        let q=snap2(p,sel,d.anc);
        if(e.shiftKey){
          const L=Math.hypot(q.x-g.c.x,q.y-g.c.y),a=Math.round(Math.atan2(q.y-g.c.y,q.x-g.c.x)/(Math.PI/12))*(Math.PI/12);
          q={x:g.c.x+L*Math.cos(a),y:g.c.y+L*Math.sin(a)};unsnap();
        }
        s.px=f(q.x);s.py=f(q.y);return;
      }
      unsnap();
      const v=g.hz?p.x:p.y;
      if(h==='ccr'){
        const m=Math.min(g.w,g.h)/2;
        s.r=Math.round(Math.max(0,Math.min(m,Math.max(0,Math.min(m,d.r0))+((p.x-d.from.x)+(p.y-d.from.y))/2)));return;
      }
      if(h==='cbd'){
        const dx=g.tip.x-g.c.x,dy=g.tip.y-g.c.y,L2=dx*dx+dy*dy;if(!L2)return;
        const k=((p.x-(g.c.x+g.tip.x)/2)*-dy+(p.y-(g.c.y+g.tip.y)/2)*dx)/L2;
        s.bend=Math.round(Math.max(-.5,Math.min(.5,2*k))*100)/100;return;
      }
      let uc=v;
      if(h==='cb0'||h==='cb1'){
        const o=h==='cb0'?g.u+g.tw/2:g.u-g.tw/2;
        let a0=g.lo,a1=g.hi;
        if(!g.ell){
          const st=g.hz?g.x:g.y,en=st+(g.hz?g.w:g.h),R=g.R;
          a0=o<=en-R?st+R:st+(en-o);
          a1=o>=st+R?en-R:en-(o-st);
        }
        const w=Math.max(a0,Math.min(a1,v));
        s.tw=f(Math.max(2,Math.abs(w-o)));uc=(w+o)/2;
      }
      const g2=coInfo(s),sp=g2.hi-g2.lo-g2.tw;
      s.tb=sp>0?r4(Math.max(0,Math.min(1,(uc-g2.lo-g2.tw/2)/sp))):.5;
    }
    function endPointer(e){
      act.delete(e.pointerId);
      if(gest&&act.size<2){gest=null;if(act.size===1){const v=[...act.values()][0];pan={x:v.x,y:v.y,moved:99};}return;}
      if(gest)return;
      if(gdrag)return guideEnd(e);
      if(pan){
        const sw=pan.sw,g=sw?swDir(e.clientX-sw.x,e.clientY-sw.y,performance.now()-sw.t):'';
        const tap=pan.moved<TAP||!!g,des=pan.deselect,t=pan.tap,fo=pan.fo,tw=pan.tw;pan=null;cv.classList.remove('panning');
        if(tw!=null){if(tap&&tw>=0)twPick(S.objects[tw]);return;}
        if(flow){
          if(tap){const s=fo!=null&&fo>=0?S.objects[fo]:null,tp=flCv&&s?tapSim(s,g||'tap'):null;flMenu=null;
            flFoc=s&&(tp||!(flFoc&&flFoc.k==='o'&&flFoc.id===s.id))?{k:'o',id:s.id}:null;
            if(flFoc)flShow(flFoc);else{flPanel=false;if(flCv&&!s){pick([]);selBg=false;selG=-1;}}
            render();
            if(tp&&tp.pg)pgPlay(tp.pg);}
          return;
        }
        if(tap&&t)return tapPick(t);
        if(tap&&des){pick([]);selBg=false;selG=-1;gIn=null;render();}
        return;
      }
      if(drag){
        if(drag.msel&&!drag.live){const u=drag.unit||[drag.hit];pick(ms.filter(q=>u.indexOf(q)<0));selGrp=exactGrp();resel();}
        else if(drag.grp&&!drag.live)pickG(drag.unit||[drag.hit],drag.ug);
        if(drag.live)glLink(ms);
        drag=null;unsnap();render();store(true);return;
      }
      if(!draft||isPD(draft))return;
      const a=draft.a,c=draft.c;
      unsnap();
      if(draft.t==='reg'){
        const r=Math.hypot(c.x-a.x,c.y-a.y);
        const rot=Math.atan2(c.y-a.y,c.x-a.x);
        if(r>6)add({t:'reg',cx:a.x,cy:a.y,rr:r,sides:sidesN(),rot:Math.round(rot*180/Math.PI*10)/10,r:0,tens:0});
        draft=null;setTool('select');return;
      }
      if(draft.t==='rect'){
        const w=Math.abs(c.x-a.x),h=Math.abs(c.y-a.y);
        if(w>4&&h>4)add({t:'rect',x:Math.min(a.x,c.x),y:Math.min(a.y,c.y),w:w,h:h,r:0});
      }else if(draft.t==='card'){
        const w=Math.abs(c.x-a.x),h=Math.abs(c.y-a.y);
        if(w>4&&h>4){const s={t:'card',src:'ui',x:Math.min(a.x,c.x),y:Math.min(a.y,c.y),w:w,h:h};add(s);ceOpen(s.id);}
      }else if(draft.t==='callout'){
        const w=Math.abs(c.x-a.x),h=Math.abs(c.y-a.y),x=Math.min(a.x,c.x),y=Math.min(a.y,c.y),m=Math.min(w,h);
        if(w>4&&h>4)add({t:'callout',x:x,y:y,w:w,h:h,r:Math.round(m*.15),body:'rect',tail:'wedge',
          px:f(x+w*.3),py:f(y+h+Math.max(20,h*.6)),tb:.3,tw:Math.max(4,Math.round(m*.3)),bend:0,lw:3});
      }else{
        const r=Math.hypot(c.x-a.x,c.y-a.y);
        if(r>6){
          if(draft.t==='circle')add({t:'circle',cx:a.x,cy:a.y,rr:r});
          else add({t:'ring',cx:a.x,cy:a.y,r1:Math.round(r*.45),r2:Math.round(r),a0:-45,a1:45});
        }
      }
      draft=null;setTool('select');
    }
    function tapSim(s,g){
      const P=tapPlan(s,g||'tap');if(!P.length)return null;
      let pg=null;
      P.forEach(q=>{
        const r=q.r,xp=q.a,mv=q.mv;
        if(actSty(r)&&tapLit.has(r.id)&&tapRe(r))requestAnimationFrame(()=>requestAnimationFrame(()=>tapReplay(r)));
        if(actSty(r))tapLit.add(r.id);
        if(mv)amTap(r,mv);
        if(xp&&actA(xp)==='toggle'&&isSp(xp.e))spSvc(xp.e,actSvc(xp.e),{});
        else if(xp&&actA(xp)==='svc'&&isSp(xp.e))spSvc(xp.e,String(xp.svc||''),svcData(xp.d).o);
        if(xp&&actA(xp)==='info'&&ENT_OK.test(xp.e||'')){const ev=new Event('hass-more-info',{bubbles:true,composed:true});ev.detail={entityId:xp.e};self.dispatchEvent(ev);}
        if(xp&&actA(xp)==='page')pg=xp;
      });
      return {pg:pg};
    }
    function tapPick(t){
      if(S.objects.indexOf(t.s)<0)return;
      gIn=t.ctx;
      selBg=false;selG=-1;
      if(t.direct&&t.s.g!=null)unfoldTo(t.s.g);
      if(t.add){
        const all=t.unit.every(isSel);
        pick(all?ms.filter(q=>t.unit.indexOf(q)<0):ms.concat(t.unit.filter(q=>!isSel(q))));
        selGrp=exactGrp();resel();render();return;
      }
      pickG(t.unit,t.ug);render();
    }
    function hover(e){
      if(TW){const h=e&&e.pointerType!=='touch'&&e.target.closest?e.target.closest('[data-i]'):null,s=h&&S.objects[+h.dataset.i];twHv(s?s.id:null);return;}
      let g=null;
      if(e&&e.pointerType!=='touch'&&!flow&&tool==='select'&&!drag&&!pan&&!gest&&!spaceDown){
        const h=e.target.closest?e.target.closest('[data-i]'):null,s=h&&S.objects[+h.dataset.i];
        const u=s&&unitFor(s,false);
        if(u&&u.ug!=null&&!u.unit.every(isSel))g=u.ug;
      }
      if(g!==hovG){hovG=g;req();}
    }
    cv.addEventListener('pointerover',hover);
    cv.addEventListener('pointerleave',()=>{if(TW)twHv(null);});
    cv.addEventListener('pointerup',endPointer);
    cv.addEventListener('pointercancel',endPointer);
    cv.addEventListener('dragstart',e=>e.preventDefault());
    cv.addEventListener('drop',e=>e.preventDefault());
    cv.addEventListener('contextmenu',e=>{if(draft&&isPD(draft)){e.preventDefault();undoPoint();}});
    cv.addEventListener('dblclick',e=>{
      if(flow)return;
      const he=tool==='select'&&e.target.closest?e.target.closest('[data-i]'):null;
      const hs=he&&S.objects[+he.dataset.i];
      const hu=hs&&unitFor(hs,false);
      if(hu&&hu.ug!=null){
        settle();gIn=hu.ug;const v=unitFor(hs,false);pickG(v.unit,v.ug);unfoldTo(hu.ug);render();return;
      }
      if(sel<0)return;
      const s=S.objects[sel];if(!s||s.t!=='poly'&&s.t!=='line')return;
      settle();
      const v=e.target.dataset.v;
      if(v!==undefined){const j=+v;ptType(s,[j],!ptCurve(s,s.p[j]));vsSet(s,[j]);render();store(true);return;}
      const p=pt(e);let bi=-1,bd=Infinity,bp=null;
      for(let i=0;i<s.p.length-(s.t==='line'?1:0);i++){
        const a=s.p[i],b=s.p[(i+1)%s.p.length],vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy||1;
        let t=((p.x-a.x)*vx+(p.y-a.y)*vy)/l2;t=Math.max(0,Math.min(1,t));
        const q={x:a.x+vx*t,y:a.y+vy*t},d=Math.hypot(q.x-p.x,q.y-p.y);
        if(d<bd){bd=d;bi=i;bp=q;}
      }
      if(bp&&bd*zoom<24){s.p.splice(bi+1,0,{x:iv(bp.x),y:iv(bp.y)});vsSet(s,[bi+1]);render();store(true);}
    });
    let vsel=null;
    const ptMin=s=>s.t==='line'?2:3;
    function vsOf(){
      const s=sel>=0?S.objects[sel]:null;
      if(!vsel||!s||vsel.o!==s||s.t!=='poly'&&s.t!=='line'||locked(s)||vHid(s))return [];
      return vsel.j.filter(j=>j<s.p.length);
    }
    function vsSet(s,J){vsel=s&&J.length?{o:s,j:J.filter((j,i)=>J.indexOf(j)===i).sort((a,b)=>a-b)}:null;}
    const ptCurve=(s,q)=>crK(q,s.tens)>0;
    function ptType(s,J,curve){
      J.forEach(j=>{
        const q=Object.assign({},s.p[j]);
        if(curve){delete q.s;if(!ptCurve(s,q))q.k=.5;}else q.s=true;
        s.p[j]=q;
      });
    }
    function ptAdd(s,j,ext){
      const p=s.p,n=p.length;
      if(ext&&s.t==='line'&&(j===0||j===n-1)){
        const a=p[j],b=p[j?j-1:1],L=Math.hypot(a.x-b.x,a.y-b.y)||1,d=Math.max(20,L/2)/L;
        const q={x:iv(a.x+(a.x-b.x)*d),y:iv(a.y+(a.y-b.y)*d)};
        if(j){p.push(q);return n;}
        p.unshift(q);return 0;
      }
      const g=crSegs(p,s.tens,s.t!=='line')[j];if(!g)return -1;
      const m=bzAt(g,.5);p.splice(j+1,0,{x:iv(m.x),y:iv(m.y)});return j+1;
    }
    function ptDel(s,J){
      if(s.p.length-J.length<ptMin(s)){stamp('at least '+ptMin(s)+' points');return false;}
      J.slice().sort((a,b)=>b-a).forEach(j=>s.p.splice(j,1));
      return true;
    }
    function ptMids(s){
      const L=(coarse?56:40)/zoom;
      return crSegs(s.p,s.tens,s.t!=='line').map((g,i)=>Math.hypot(g.b.x-g.a.x,g.b.y-g.a.y)>=L?Object.assign({i:i},bzAt(g,.5)):null).filter(Boolean);
    }
    function isPD(d){return !!d&&(d.t==='poly'||d.t==='line');}
    function commitPoly(){
      if(draft&&draft.t==='line'){if(draft.p.length>=2)add({t:'line',p:draft.p.slice()});}
      else if(draft&&draft.p.length>2)add({t:'poly',p:draft.p.slice(),r:0});
      draft=null;setTool('select');
    }
    function undoPoint(){if(!isPD(draft))return;draft.p.pop();if(!draft.p.length)draft=null;render();}
    function lead(s,id,n){
      const r=Object.assign({},s);
      Object.keys(s).forEach(k=>{delete s[k];});
      Object.assign(s,{id:id,t:r.t,n:n},r,{id:id,n:n});
    }
    function add(s,quiet,at){
      lead(s,newId('o',S.objects),typeof s.n==='string'&&s.n.trim()?s.n:newName(s));
      if(hasPgs()&&!('pg' in s))s.pg=cpg();
      const put=()=>{if(at==null)S.objects.push(s);else S.objects.splice(at,0,s);};
      if(s.g==null)gIn=null;
      put();pick([s]);if(!quiet){glLink([s]);render();store(true);}
    }
    function dupSel(){
      const src=S.objects.filter(isSel),made=[],map=new Map(),fg=fullG(src);
      const cloneG=(id,p,top)=>{
        const G=grpOf(id),nid=gNext(),c={id:nid,n:top?((G&&G.n)||'Group')+' copy':((G&&G.n)||'')};
        if(p!=null)c.p=p;
        const kids=S.groups.filter(x=>x.p===id);
        S.groups.push(c);map.set(id,nid);fold().delete(nid);joinRules(id,nid);
        kids.forEach(x=>cloneG(x.id,nid,false));
      };
      fg.forEach(id=>cloneG(id,gpar(id),true));
      if(map.size)foldSave();
      src.forEach(q=>{
        const c=JSON.parse(JSON.stringify(q));delete c.lk;delete c.gl;move(c,20,20);
        c.n=copyName(c);
        const u=fg.find(id=>inG(q,id));
        if(u!=null)c.g=map.get(q.g);
        const C=u!=null?gpar(u):(q.g==null?null:q.g);
        add(c,true,C==null?null:lastIn(C)+1);joinRules(q.id,c.id);
        if(q.pg)c.pg=q.pg;else delete c.pg;
        made.push(c);
      });
      const one=fg.length===1&&src.every(q=>inG(q,fg[0]))?map.get(fg[0]):null;
      pickG(made,one);render();store(true);
    }
    function delSel(kb){
      const all=S.objects.filter(isSel),keep=kb?all.filter(locked):[];
      if(!all.length)return;
      if(keep.length===all.length){stamp(all.length===1?'item locked':'items locked');return;}
      S.objects.map((q,i)=>isSel(q)&&keep.indexOf(q)<0?i:-1).filter(i=>i>=0).reverse().forEach(removeAt);
      pick(keep);render();store(true);
      if(keep.length)stamp(keep.length===1?'1 locked item not deleted':keep.length+' locked items not deleted');
    }
    function removeAt(i){if(S.objects[i])S.objects.splice(i,1);}

    const onKey=e=>{
      const path=e.composedPath?e.composedPath():[];
      if(!root.getElementById('erd').hidden){
        if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();errClose();}
        return;
      }
      if(TW){
        if(e.key==='Escape'){e.preventDefault();twClose(false);}
        else if(e.key==='Enter'&&!TWE.ok.disabled){e.preventDefault();twClose(true);}
        return;
      }
      if(!GL.el.hidden){
        if(e.key==='Escape'&&path.indexOf(GL.el)<0){
          e.preventDefault();
          if(GL.ask)galAskClose();else if(!GL.busy||GL.up)galClose();
        }
        return;
      }
      if(!CE.el.hidden){
        if(e.key==='Escape'&&path.indexOf(self)>=0&&!(CE.ed&&path.indexOf(CE.ed)>=0)&&!(CE.pk&&path.indexOf(CE.pk)>=0)){e.preventDefault();ceClose();}
        return;
      }
      if((e.key==='s'||e.key==='S')&&(e.metaKey||e.ctrlKey)&&!e.shiftKey&&!e.altKey){e.preventDefault();if(proj)saveProject();return;}
      if(e.key==='Escape'&&!E.pmenu.hidden){e.preventDefault();pmShow(false);return;}
      if(path.some(n=>n&&n.tagName&&/^(INPUT|TEXTAREA|SELECT)$/.test(n.tagName)))return;
      if(path.some(n=>n&&n.nodeType===1&&(n.tagName==='DIALOG'||/^(alert)?dialog$/.test(n.getAttribute('role')||''))))return;
      if(drawerOpen)return;
      if(e.key===' '||e.code==='Space'){
        if(e.ctrlKey||e.metaKey||e.altKey)return;
        e.preventDefault();
        if(!spaceDown){spaceDown=true;cv.classList.add('space');hover(null);}
        return;
      }
      if((e.key==='h'||e.key==='H')&&!e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();setTool(tool==='hand'?'select':'hand');return;}
      if(isPD(draft)){
        if(e.key==='Enter'){e.preventDefault();return commitPoly();}
        if(e.key==='Backspace'||e.key==='Delete'||(e.key==='z'&&(e.metaKey||e.ctrlKey))){e.preventDefault();return undoPoint();}
      }
      if(e.key==='Escape'){
        if(ldrag)return listCancel();
        if(flow&&(flMenu||flFoc)){if(flMenu)flMenu=null;else{flFoc=null;flOpen='';flPanel=false;}render();return;}
        if(vsOf().length&&!flow){vsel=null;render();return;}
        if(gIn!=null&&!draft&&tool==='select'&&grpOf(gIn)){const id=gIn;gIn=gpar(id);pickG(members(id),id);render();return;}
        draft=null;gIn=null;pick([]);selBg=false;selG=-1;setTool('select');return;
      }
      if((e.key==='z'||e.key==='Z')&&(e.metaKey||e.ctrlKey)){e.preventDefault();return step(e.shiftKey?1:-1);}
      if((e.key==='y'||e.key==='Y')&&(e.metaKey||e.ctrlKey)){e.preventDefault();return step(1);}
      if((e.key==='+'||e.key==='=')&&!e.metaKey&&!e.ctrlKey){e.preventDefault();return setZoom(zoom*1.25);}
      if(e.key==='-'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();return setZoom(zoom*.8);}
      if(e.key==='0'&&!e.metaKey&&!e.ctrlKey){e.preventDefault();return fit();}
      if(flow)return;
      if(selG>=0&&S.guides[selG]){
        if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();settle();S.guides.splice(selG,1);selG=-1;render();store(true);return;}
        if(e.key.indexOf('Arrow')===0&&!glock){
          const g=S.guides[selG],d=(e.shiftKey?10:1)*(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1);
          if(!!g.v===(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();moveGuide(g,g.c+d);render();store();}
          return;
        }
      }
      if(e.key==='Enter'&&selGrp!=null&&tool==='select'&&!draft&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
        e.preventDefault();
        const id=selGrp;gIn=id;unfold(id);pickG(members(id),null);selGrp=exactGrp();resel();render();return;
      }
      if((e.key==='g'||e.key==='G')&&(e.metaKey||e.ctrlKey)&&!e.altKey){
        e.preventDefault();
        if(e.shiftKey)ungroup(fullG(ms));else groupSel();
        return;
      }
      if((e.key==='Delete'||e.key==='Backspace')&&selGrp!=null){
        e.preventDefault();
        if(chainG(selGrp).some(grpLk)){stamp('group locked');return;}
        ungroup([selGrp]);return;
      }
      {const J=vsOf(),s=J.length&&S.objects[sel];
        if(s&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();settle();if(ptDel(s,J))vsSet(s,[Math.max(0,J[0]-1)]);render();store(true);return;}
        if(s&&e.key.indexOf('Arrow')===0){e.preventDefault();const d=e.shiftKey?10:1;
          const dx=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,dy=e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0;
          J.forEach(j=>{s.p[j]=Object.assign({},s.p[j],{x:s.p[j].x+dx,y:s.p[j].y+dy});});render();store();return;}
        if(s&&e.key==='Tab'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();const n=s.p.length;vsSet(s,[((e.shiftKey?J[0]-1:J[J.length-1]+1)+n)%n]);render();return;}
        const o=sel>=0&&S.objects[sel];
        if((e.key==='a'||e.key==='A')&&(e.metaKey||e.ctrlKey)&&!e.shiftKey&&!e.altKey&&o&&(o.t==='poly'||o.t==='line')&&!locked(o)&&!vHid(o)){
          e.preventDefault();vsSet(o,o.p.map((q,j)=>j));render();return;}
      }
      if((e.key==='Delete'||e.key==='Backspace')&&ms.length){settle();e.preventDefault();delSel(true);return;}
      if(e.key==='d'&&(e.metaKey||e.ctrlKey)&&ms.length){e.preventDefault();settle();dupSel();return;}
      if(e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.key==='H'||e.key==='h'||e.key==='V'||e.key==='v')&&ms.length){
        e.preventDefault();xform(e.key.toLowerCase());return;}
      if(ms.length&&e.key.indexOf('Arrow')===0){e.preventDefault();const d=e.shiftKey?10:1;
        const dx=e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,dy=e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0;
        const mv=movers(ms);
        if(!mv.length){stamp(ms.length===1?'item locked':'items locked');return;}
        mv.forEach(q=>move(q,dx,dy));render();store();}
    };
    const onKeyUp=e=>{if((e.key===' '||e.code==='Space')&&spaceDown){spaceUp();e.preventDefault();}};
    const onBlur=()=>spaceUp();
    const onHide=()=>{if(document.visibilityState==='hidden')flush();};
    let listening=false;
    function start(){
      if(listening)return;listening=true;
      window.addEventListener('keydown',onKey);
      window.addEventListener('keyup',onKeyUp);
      window.addEventListener('blur',onBlur);
      window.addEventListener('pagehide',flush);
      document.addEventListener('visibilitychange',onHide);
    }
    function stop(){
      clkStop();flush();pickClose();galClose();ceClose(true);
      if(!listening)return;listening=false;
      window.removeEventListener('keydown',onKey);
      window.removeEventListener('keyup',onKeyUp);
      window.removeEventListener('blur',onBlur);
      window.removeEventListener('pagehide',flush);spaceUp();
      document.removeEventListener('visibilitychange',onHide);
    }

    const phWarn=p=>{const t=pLabel(p||'','');return /^not/.test(t)?t:'';};
    function pickAttrs(kind,ph){
      return ' data-pick="'+kind+'" role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"'+
        (coarse?' inputmode="none"':'')+(ph?' placeholder="'+ph+'"':'');
    }
    function fld(l,k,step){const s=S.objects[sel];return '<label class="f">'+l+'<input class="num" data-k="'+k+'" type="number" step="'+(step||1)+'" value="'+f(s[k]||0)+'"></label>';}
    const fitVal=s=>IM(s).follow?(IM(s).fit||'cover'):(IM(s).tfit||'');
    const fitLabel=s=>IM(s).follow?'Fit to shape':'Align to background';
    function fitOpts(s){
      const v=fitVal(s),o=(IM(s).follow?[]:[['','as background']]).concat(IFIT);
      return o.map(x=>'<option value="'+x[0]+'"'+(x[0]===v?' selected':'')+'>'+x[1]+'</option>').join('');
    }
    const IBPX=w=>w==='w'||w==='h'||w==='x'||w==='y';
    function ibVal(s,w){
      const b=ibox(s),F=ibRef(s);
      if(w==='w'||w==='h')return iv(w==='w'?b[2]*F.w:b[3]*F.h);
      if(w==='x'||w==='y')return iv(w==='x'?(b[0]-.5)*F.w:(b[1]-.5)*F.h);
      return f(b[2]*100);
    }
    function ibFld(l,w,step,extra){
      const s=curPh(S.objects[sel]),u=IBPX(w);
      return '<label class="f">'+l+'<span><input class="num" data-ib="'+w+'" type="number" step="'+step+'" '+(extra||'')+' style="width:72px" value="'+ibVal(s,w)+'">'+(u?'<span style="visibility:hidden"> %</span>':' %')+'</span></label>';
    }
    function idText(s){return 'id '+s.id+' in the exported files';}
    function iconHint(s){return icons.get(s.icon)===''?'icon not found':'';}
    function posList(){return selGrp!=null&&grpOf(selGrp)?members(selGrp):ms.length?ms.slice():[];}
    function posVal(w){
      const L=posList();if(!L.length)return '';const b=bboxOf(L);
      return String(iv(w==='x'?b.x0:w==='y'?b.y0:w==='w'?b.x1-b.x0:b.y1-b.y0));
    }
    const posFlds=()=>['x','y'].map(w=>'<label class="f">'+w+'<input class="num" data-pos="'+w+'" type="number" step="1" value="'+posVal(w)+'"></label>').join('')+
      [['w','width'],['h','height']].map(([w,l])=>'<label class="f">'+l+'<input class="num" data-pos="'+w+'" data-psz="1" type="number" min="1" step="1" value="'+posVal(w)+'"></label>').join('');
    function scaleList(L,k,ax,ay){
      const T=(x,y)=>({x:f(ax+(x-ax)*k),y:f(ay+(y-ay)*k)}),K=v=>f(v*k);
      L.forEach(s=>{
        if(isEl(s)){const p=T(s.x||0,s.y||0);s.x=p.x;s.y=p.y;s.size=Math.max(4,Math.round((s.size||(s.t==='label'?18:28))*k));return;}
        if(s.t==='poly'||s.t==='line')s.p=s.p.map(q=>Object.assign({},q,T(q.x,q.y)));
        else if(s.t==='rect'||s.t==='callout'||s.t==='card'){
          const p=T(s.x,s.y);s.x=p.x;s.y=p.y;s.w=K(s.w);s.h=K(s.h);
          if(s.t==='callout'){const q=T(s.px,s.py);s.px=q.x;s.py=q.y;['tw','lw'].forEach(w=>{if(typeof s[w]==='number')s[w]=K(s[w]);});if(typeof s.dot==='number')s.dot=K(s.dot);}
        }else{
          const c=T(s.cx,s.cy);s.cx=c.x;s.cy=c.y;
          if(s.t==='ring'){s.r1=K(s.r1);s.r2=K(s.r2);}else s.rr=K(s.rr);
        }
        if(typeof s.r==='number'&&s.t!=='ring')s.r=K(s.r);
      });
    }
    const DEL_SVG='<svg viewBox="0 0 24 24"><path d="M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z"/></svg>';
    function vsRow(){
      const n=E.insp.querySelector('#vsr');if(!n)return;
      const s=S.objects[sel],J=vsOf(),one=J.length===1,C=J.filter(j=>ptCurve(s,s.p[j])),k=C.length?crK(s.p[C[0]],s.tens)*6:0;
      const crv=C.length===J.length?'1':C.length?'':'0';
      const key=J.length?[one?J[0]:'m'+J.length,s.p.length,crv,C.length>0].join(' '):'';
      if(n._k!==key){
        n._k=key;
        const B=(z,l,t,x)=>'<button type="button" data-vs="'+z+'" title="'+t+'" aria-label="'+t+'"'+(x||'')+'>'+l+'</button>';
        n.innerHTML=!J.length?'':
          '<div class="row vsb"><div class="seg">'+B('prev','‹','Previous point (Shift+Tab)')+B('next','›','Next point (Tab)')+'</div>'+
          '<span class="vsn">'+(one?(J[0]+1)+'/'+s.p.length:J.length+' points')+'</span>'+
          '<div class="seg">'+B('s','◆','Corner',' aria-pressed="'+(crv==='0')+'"')+B('c','●','Curve',' aria-pressed="'+(crv==='1')+'"')+'</div>'+
          '<div class="seg">'+(one?B('add','+','Add point'):'')+B('del',DEL_SVG,'Delete (Del)',s.p.length-J.length<ptMin(s)?' disabled':'')+'</div></div>'+
          (one?['x','y'].map(w=>'<label class="f">point '+w+'<input class="num" data-vsk="'+w+'" type="number" step="1" value="'+f(s.p[J[0]][w])+'"></label>').join(''):'')+
          (C.length?'<label class="f">point curve<input class="num" data-vsk="k" type="range" min="0.05" max="1" step="0.05" value="'+f(k)+'"></label>':'');
        return;
      }
      n.querySelectorAll('input[data-vsk]').forEach(i=>{
        if(i===root.activeElement)return;
        const w=i.dataset.vsk,v=String(f(w==='k'?k:s.p[J[0]][w]));if(i.value!==v)i.value=v;
      });
    }
    E.insp.addEventListener('click',e=>{
      const b=e.target.closest('[data-vs]'),J=vsOf();if(!b||!J.length)return;
      const s=S.objects[sel],z=b.dataset.vs,n=s.p.length;
      if(z==='prev'||z==='next'){vsSet(s,[((z==='prev'?J[0]-1:J[J.length-1]+1)+n)%n]);render();return;}
      settle();
      if(z==='s'||z==='c')ptType(s,J,z==='c');
      else if(z==='add'){const j=ptAdd(s,J[0],true);if(j>=0)vsSet(s,[j]);}
      else if(z==='del'){if(!ptDel(s,J))return;vsSet(s,[Math.max(0,J[0]-1)]);}
      render();store(true);
    });
    E.insp.addEventListener('input',e=>{
      const t=e.target,w=t.dataset&&t.dataset.vsk,J=vsOf();if(!w||!J.length)return;
      const s=S.objects[sel],v=parseFloat(t.value);if(isNaN(v))return;
      if(w==='k'){const c=clamp(v,.05,1);J.forEach(j=>{if(ptCurve(s,s.p[j]))s.p[j]=Object.assign({},s.p[j],{k:c});});}
      else s.p[J[0]]=Object.assign({},s.p[J[0]],{[w]:iv(v)});
      render();store();
    });
    function syncFields(){
      if(!GM)return giro(syncFields);
      E.insp.querySelectorAll('input[data-pos]').forEach(n=>{if(n!==root.activeElement){const v=posVal(n.dataset.pos);if(n.value!==v)n.value=v;}});
      const s=sel>=0&&S.objects[sel];if(!s)return;
      E.insp.querySelectorAll('input[data-k]').forEach(n=>{
        if(n===root.activeElement||n.disabled)return;
        const v=s[n.dataset.k];
        if(typeof v!=='number')return;
        const t=String(n.type==='number'?f(v):v);
        if(n.value!==t)n.value=t;
      });
    }
    function iszRefresh(){
      const s=sel>=0&&S.objects[sel],n=s&&E.insp.querySelector('#iszr');if(!n)return;
      const L=imgSrcs(s),k=JSON.stringify(L),m=E.insp.querySelector('#iszs'),on=L.length>0&&!(s.t==='callout'&&s.body==='line');
      if(m._k!==k){const v=m.value;m._k=k;m.innerHTML=L.map(x=>'<option value="'+esc(x.p)+'">'+esc(x.l)+'</option>').join('');if(L.some(x=>x.p===v))m.value=v;}
      if(m.style.display!==(L.length>1?'':'none'))m.style.display=L.length>1?'':'none';
      if(n.style.display!==(on?'':'none'))n.style.display=on?'':'none';
    }
    function insRefresh(){
      const s=sel>=0&&S.objects[sel];if(!s)return;
      const q=k=>E.insp.querySelector(k);
      let n=q('#idh');if(n)n.textContent=idText(s);
      const V=isEl(s)?s:curPh(s),I=IM(V);
      n=q('#iw');if(n)n.style.display=I.p?'':'none';
      n=q('#ih');if(n){const t=phWarn(I.p);if(n.textContent!==t)n.textContent=t;n.hidden=!t;}
      E.insp.querySelectorAll('[data-im]').forEach(b=>{const v=String((b.dataset.im==='1')===!!I.follow);if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);});
      n=q('#ifb');if(n&&n.textContent!==fitLabel(V))n.textContent=fitLabel(V);
      E.insp.querySelectorAll('input[data-ib]').forEach(i=>{if(i!==root.activeElement){const v=String(ibVal(V,i.dataset.ib));if(i.value!==v)i.value=v;}});
      E.insp.querySelectorAll('.phr[data-phi]').forEach(r=>{
        const P=phAll(s)[+r.dataset.phi];if(!P)return;
        const b=r.querySelector('b'),m=r.querySelector('small'),t=phName(s,P),u=P.p?P.p.split('/').pop():'no file';
        if(b&&b.textContent!==t)b.textContent=t;if(m&&m.textContent!==u)m.textContent=u;
      });
      n=q('select[data-ib="fit"]');
      if(n&&n!==root.activeElement){
        const md=I.follow?'1':'0';
        if(n.dataset.mode!==md){n.dataset.mode=md;n.innerHTML=fitOpts(V);}
        else if(n.value!==fitVal(V))n.value=fitVal(V);
      }
      n=q('#rw');if(n)n.style.display=(s.p?crOn(s.p,s.tens):(s.tens||0)>0)?'none':'';
      vsRow();
      if(s.t==='line')[0,1].forEach(j=>{const m=q('#lh'+j),v=LN_HOL[lnEnd(s,j)]?'':'none';if(m&&m.style.display!==v)m.style.display=v;});
      iszRefresh();
      if(s.t==='callout'){
        const g=coInfo(s),dsp=(id,on)=>{const m=q(id);if(m&&m.style.display!==(on?'':'none'))m.style.display=on?'':'none';};
        const lv=g.ln&&s.lo==='v';
        dsp('#ccr',!g.ell&&!g.ln);dsp('#ctw',g.tail!=='line');dsp('#clw',g.tail==='line'||g.ln);dsp('#cbd',g.tail==='curved');
        dsp('#clo',g.ln);dsp('#cwf',!lv);dsp('#chf',!g.ln||lv);dsp('#cdt',g.tail==='line');
        n=q('input[data-k="dot"]');if(n){const p='auto '+f(coDotAuto(s)*2);if(n.placeholder!==p)n.placeholder=p;if(n!==root.activeElement&&typeof s.dot!=='number'&&n.value!=='')n.value='';}
        n=q('#ctw label');if(n&&n.firstChild){const t=g.tail==='bubbles'?'bubble size':'tail width';if(n.firstChild.nodeValue!==t)n.firstChild.nodeValue=t;}
        n=q('#cth');if(n){const t=g.inside?CO_IN:'';if(n.textContent!==t)n.textContent=t;n.style.display=t?'':'none';}
      }
      n=q('#lszl');
      if(n&&s.t==='label'){
        const fs=lblTx(s).fs,i=q('input[data-k="size"]'),t=fs?'font size (px) · style':'font size (px)';
        if(n.textContent!==t)n.textContent=t;
        if(i&&i!==root.activeElement){i.disabled=!!fs;const v=String(fs?f(fs):(s.size||18));if(i.value!==v)i.value=v;}
      }
      n=q('#ich');if(n)n.textContent=iconHint(s);
    }
    function countText(list){
      const nc=list.filter(isCard).length,nl=list.filter(q=>q.t==='line').length,nz=list.filter(q=>!isEl(q)).length-nc-nl,ne=list.length-nz-nc-nl,parts=[];
      if(nz)parts.push(nz+(nz===1?' zone':' zones'));
      if(nl)parts.push(nl+(nl===1?' line':' lines'));
      if(nc)parts.push(nc+(nc===1?' card':' cards'));
      if(ne)parts.push(ne+(ne===1?' element':' elements'));
      return parts.join(' and ');
    }
    function grpCount(id){
      const sub=(S.groups||[]).filter(g=>g.id!==id&&chainG(g.id).indexOf(id)>=0).length;
      return countText(members(id))+(sub?', '+sub+(sub===1?' subgroup':' subgroups'):'');
    }
    const ITABS=[['set','Settings'],['look','Look'],['bh','Behavior']];
    let iTab='set';
    try{const v=localStorage.getItem(KEY+'-itab');if(ITABS.some(t=>t[0]===v))iTab=v;}catch(_){}
    E.insp.dataset.itab=iTab;
    function pgFld(){
      if(!hasPgs()||!ms.length)return '';
      const v=new Set(ms.map(q=>q.pg||'')),one=v.size===1?[...v][0]:null;
      return '<label class="f col">page<select class="num" id="ipg">'+(one==null?'<option value="?" selected>—</option>':'')+
        '<option value=""'+(one===''?' selected':'')+'>all pages</option>'+
        PGS().map(p=>'<option value="'+p.id+'"'+(one===p.id?' selected':'')+'>'+esc(pgName(p))+'</option>').join('')+'</select></label>';
    }
    function itabs(set,bh,look){
      const P={set:set+pgFld(),bh:bh,look:look};
      return '<div class="itabs" role="tablist" aria-label="Selection">'+ITABS.map(([k,l])=>
          '<button type="button" role="tab" data-itab="'+k+'" aria-selected="'+(k===iTab)+'">'+l+'</button>').join('')+'</div>'+
        ITABS.map(([k])=>'<div class="ipane" data-pane="'+k+'" role="tabpanel">'+P[k]+'</div>').join('');
    }
    E.insp.addEventListener('change',e=>{
      const t=e.target;
      if(t.dataset.bh==='pg'){const o=bhTarget(),v=t.value;t.value='';if(o&&v)pgLink(o,v);return;}
      if(t.dataset.bh==='thru'){
        const o=bhTarget();if(!o)return;
        settle();thruZs(o).forEach(s=>{if(t.checked)s.thru=true;else delete s.thru;});render();store(true);return;
      }
      if(t.id!=='ipg'||t.value==='?')return;
      settle();
      pgMove(ms.slice(),t.value);
      if(t.value&&t.value!==cpg()){pick([]);selGrp=null;gIn=null;}
      inspObj=null;render();store(true);
    });
    function setITab(k){
      iTab=k;E.insp.dataset.itab=k;
      E.insp.querySelectorAll('[data-itab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.itab===k)));
      try{localStorage.setItem(KEY+'-itab',k);}catch(_){}
    }
    const EV_OPS=[['=','='],['!=','≠'],['>','>'],['>=','≥'],['<','<'],['<=','≤'],['btw','between']];
    const evNum=v=>v!==''&&v!=null&&typeof v!=='boolean'&&isFinite(Number(v));
    function evAttrOpts(k){
      const h=self._hass,st=h&&h.states&&k.e?h.states[k.e]:null,attrs=st&&st.attributes?Object.keys(st.attributes):[];
      return '<option value=""'+(!k.a?' selected':'')+'>state</option>'+
        attrs.map(a=>'<option'+(a===k.a?' selected':'')+'>'+esc(a)+'</option>').join('')+
        (k.a&&attrs.indexOf(k.a)<0?'<option selected>'+esc(k.a)+'</option>':'');
    }
    const EV_BOLT='<svg viewBox="0 0 24 24"><path d="M7,2V13H10V22L17,10H13L17,2H7Z"/></svg>';
    const usesText=n=>n?n+(n===1?' use':' uses'):'unused';
    const idsStys=a=>Array.isArray(a)&&a.length?a.map(stById).filter((x,i,A)=>x&&A.indexOf(x)===i):[];
    function evBadge(o,gid){
      if(!o)return '';
      const R=RULS(),own=R.filter(r=>rOn(r).indexOf(o.id)>=0);
      const inside=gid==null?[]:R.filter(r=>own.indexOf(r)<0&&rOn(r).some(id=>{
        const s=objOf(id);return s?inG(s,gid):!!grpOf(id)&&id!==gid&&chainG(id).indexOf(gid)>=0;}));
      const n=inside.length,of=own.filter(rForced).length,nf=inside.filter(rForced).length;
      if(!own.length&&!n)return '';
      const ev=k=>k+(k===1?' rule':' rules');
      const t=[own.length?ev(own.length)+(of?' · '+of+' forced by test':''):'',n?ev(n)+' inside'+(nf?' · '+nf+' forced by test':''):''].filter(Boolean).join(' · ');
      return '<span class="evbd'+(of||nf?' f':'')+'" title="'+t+'"><svg viewBox="0 0 24 24"><path d="M7,2V13H10V22L17,10H13L17,2H7Z"/></svg></span>';
    }
    function evLayers(s){return evLayersT(s).map(o=>o.x);}
    function evLayersT(s){
      const T=[s.id].concat(chainOf(s)),L=[];
      RULS().slice().reverse().forEach(r=>{const O=rOn(r);if(O.some(id=>T.indexOf(id)>=0)&&rCanvas(r)){const g=O.indexOf(s.id)<0;idsStys(rSty(r)).forEach(x=>L.push({x:x,g:g}));}});
      if(flow&&flCv&&(tapLit.size||tapMv.size))litLys().slice().reverse().forEach(q=>{
        const x=q.x;if(!(x.to||[]).some(id=>T.indexOf(id)>=0))return;
        const g=x.to.indexOf(s.id)<0;idsStys(x.sty).forEach(q=>L.push({x:q,g:g}));
      });
      else tapLay(T);
      return L;
    }
    const CAUS=()=>Array.isArray(S.causes)?S.causes:[];
    const RULS=()=>Array.isArray(S.rules)?S.rules:[];
    const causeOf=id=>{
      if(GM){let m=GM.ci;if(!m){m=GM.ci=new Map();CAUS().forEach(k=>{if(k&&!m.has(k.id))m.set(k.id,k);});}return m.get(id)||drCause(id);}
      return CAUS().find(k=>k&&k.id===id)||drCause(id);
    };
    const ruleOf=id=>RULS().find(r=>r&&r.id===id)||(drR&&drR.id===id?drR:null);
    const drCause=id=>typeof id==='string'&&id.slice(0,2)==='xc'?(drC&&drC.k.id===id?drC.k:drK.find(k=>k.id===id)||null):null;
    const kDr=k=>!!k&&String(k.id).slice(0,2)==='xc';
    const rCs=r=>mem('cs',r,()=>(Array.isArray(r&&r.c)?r.c:[]).map(causeOf).filter(Boolean));
    const rOr=r=>!!r&&r.j==='or';
    const rOn=r=>Array.isArray(r&&r.on)?r.on:[];
    const rNum=r=>String(r.id).slice(1);
    function rSty(r){
      const a=[];
      (Array.isArray(r&&r.fx)?r.fx:[]).forEach(x=>{if(x&&x.k==='look'&&Array.isArray(x.sty))x.sty.forEach(id=>{if(a.indexOf(id)<0)a.push(id);});});
      return a;
    }
    function rLook(r){
      if(!Array.isArray(r.fx))r.fx=[];
      let x=r.fx.find(q=>q&&q.k==='look');
      if(!x){x={k:'look',sty:[]};r.fx.push(x);}
      if(!Array.isArray(x.sty))x.sty=[];
      return x;
    }
    const isGrp=o=>!!o&&(S.groups||[]).indexOf(o)>=0;
    const tgtOf=id=>grpOf(id)||objOf(id)||bgOf(id)||null;
    const rBgs=r=>rOn(r).map(bgOf).filter(Boolean);
    const rTgs=r=>rObjs(r).concat(rBgs(r));
    const rHas=(r,o)=>isBgl(o)?rOn(r).indexOf(o.id)>=0:rObjs(r).indexOf(o)>=0;
    const foOf=id=>objOf(id)||bgOf(id);
    function rObjs(r){return mem('ro',r,()=>{const T=rOn(r);return S.objects.filter(s=>T.indexOf(s.id)>=0||chainOf(s).some(g=>T.indexOf(g)>=0));});}
    const HELP=["var v = function (id, a) { var e = hass.states[id]; return e ? (a ? (e.attributes || {})[a] : e.state) : undefined; };",
      "var ok = function (id) { return !!hass.states[id]; };",
      "var num = function (x) { return x !== '' && x !== null && x !== undefined && typeof x !== 'boolean' && isFinite(Number(x)); };"];
    const causeJS=k=>k&&k.k==='cond'&&k.e?evJSk(k):null;
    const jsFn=new Map();
    function jsTrue(expr,states){
      let fn=jsFn.get(expr);
      if(fn===undefined){
        if(jsFn.size>400)jsFn.clear();
        try{fn=new Function('hass','"use strict";\n'+HELP.join('\n')+'\nreturn !!('+expr+');');}catch(_){fn=null;}
        jsFn.set(expr,fn);
      }
      if(!fn)return false;
      try{return fn({states:states||{}});}catch(_){return false;}
    }
    const SIM=()=>isObj(S.sim)?S.sim:{};
    const SPS=()=>Array.isArray(S.ph)?S.ph:[];
    const isSp=e=>SP_RE.test(String(e||''));
    const spOf=e=>isSp(e)?SPS().find(x=>x.e===e)||null:null;
    const entDom=e=>{const x=spOf(e);return x?x.d:String(e||'').split('.')[0];};
    const SPC={raw:null,key:'',h:null,st:{}};
    function spHass(raw){
      const L=SPS();if(!L.length||!raw||!raw.states)return raw;
      const key=JSON.stringify(L);
      if(SPC.raw===raw&&SPC.key===key)return SPC.h;
      if(SPC.key!==key){
        const t=new Date().toISOString(),o={};
        L.forEach(x=>{o[x.e]={entity_id:x.e,state:x.s,attributes:Object.assign({},x.a||{},x.n?{friendly_name:x.n}:{}),
          last_changed:t,last_updated:t,context:{id:'',parent_id:null,user_id:null}};});
        SPC.st=o;
      }
      SPC.raw=raw;SPC.key=key;
      return SPC.h=Object.assign({},raw,{states:Object.assign({},raw.states,SPC.st)});
    }
    const SP_2={cover:['open','closed'],valve:['open','closed'],lock:['locked','unlocked']};
    const SP_ON=/^(turn_on|open_cover|open_valve|lock)$/,SP_OFF=/^(turn_off|close_cover|close_valve|unlock)$/;
    function spSvc(e,svc,data){
      const v=svc.slice(svc.indexOf('.')+1),P=SP_2[entDom(e)]||['on','off'],st=simStates(true)[e];
      const cur=st?String(st.state):'';
      const nx=SP_ON.test(v)?P[0]:SP_OFF.test(v)?P[1]:v==='toggle'?(cur===P[0]?P[1]:P[0]):null;
      settle();
      if(nx!=null)simPut(e,'s',nx);
      Object.keys(data||{}).forEach(k=>{if(k!=='entity_id'){const x=data[k];simPut(e,'a:'+k,Array.isArray(x)?'['+x.join(', ')+']':String(x));}});
      store(true);
    }
    function spSync(){
      const h=spHass(self._hraw||self._hass);
      if(h&&h!==self._hass){self._hass=h;cdHass(h);}
    }
    const simOf=e=>{const x=e?SIM()[e]:null;return isObj(x)?x:null;};
    let simC=null;
    function simStates(all){
      const h=self._hass,src=(h&&h.states)||{},sj=JSON.stringify(SIM());
      if(!simC||simC.h!==src||simC.sj!==sj)simC={h:src,sj:sj,all:null,own:null};
      const key=all?'all':'own';
      if(simC[key])return simC[key];
      const out=all?Object.assign({},src):{};
      Object.keys(SIM()).forEach(e=>{
        const x=simOf(e);if(!x)return;
        const b=src[e]||{entity_id:e,state:'',attributes:{}};
        out[e]=Object.assign({},b,{state:'s' in x?String(x.s):b.state,attributes:Object.assign({},b.attributes||{},isObj(x.a)?x.a:{})});
      });
      return simC[key]=out;
    }
    const cLive=k=>{const j=causeJS(k);return !!j&&jsTrue(j,simStates(true));};
    const cNow=cLive;
    function rTruth(r,t){
      const K=rCs(r).filter(k=>causeJS(k));
      return !!K.length&&(rOr(r)?K.some(t):K.every(t));
    }
    const rNow=r=>rTruth(r,cNow);
    const cvLive=()=>flow&&flCv;
    const pvl=cvLive;
    const rCanvas=r=>mem('rc',r,()=>rTruth(r,k=>jsTrue(causeJS(k)||'false',simStates(cvLive()))));
    const rForced=r=>rCs(r).some(k=>k.k!=='tap'&&!!simOf(k.e));
    const FX_OK={cond:{look:1,sym:1,pho:1},data:{follow:1},tap:{act:1,mv:1}};
    const rKind=r=>{const k=rCs(r)[0];return k?k.k:'';};
    const fxOf=(r,k)=>(Array.isArray(r&&r.fx)?r.fx:[]).find(x=>x&&x.k===k)||null;
    const rSymI=r=>{const x=fxOf(r,'sym');return x&&typeof x.icon==='string'?x.icon.trim():'';};
    const FMAPS={brightness:'light brightness',onoff:'on / off',value:'number 0–1'};
    const BIND=['mo','op','mx','my','mr','ms','fc','fr','sp','fv','gp'];
    const BIND_M=['mo','sp','fv','gp'];
    const BIND_L={mo:'drive motion',op:'opacity',mx:'move x',my:'move y',mr:'rotate',ms:'scale',fc:'fill color',fr:'fill rotation',sp:'motion speed',fv:'flow speed',gp:'gauge'};
    const BIND_O={mo:[0,1],op:[0,1],mx:[0,100],my:[0,100],mr:[0,360],ms:[100,150],fc:['#4a90d9','#e8a33d'],fr:[0,360],sp:[0,100],fv:[0,100],gp:[0,100]};
    const BIND_R={op:[0,1],mx:[-10000,10000],my:[-10000,10000],mr:[-3600,3600],ms:[0,1000],fr:[-3600,3600],sp:[0,1000],fv:[-10000,10000],gp:[0,100]};
    const BIND_U={mo:'',op:'',mx:'px',my:'px',mr:'°',ms:'%',fc:'',fr:'°',sp:'%',fv:'px/s',gp:'%'};
    const BIND_C={op:'opacity',mx:'translate',my:'translate',mr:'rotate',ms:'scale',fc:'fill',fr:'rotate'};
    const PIV=[['tl','top left'],['t','top'],['tr','top right'],['l','left'],['c','centre'],['r','right'],['bl','bottom left'],['b','bottom'],['br','bottom right']];
    const isBind=x=>!!x&&x.k==='follow'&&BIND.indexOf(x.p)>=0;
    const moDrv=x=>{if(!x||x.p!=='mo')return null;const st=stById(+x.mo);return isAn(st)&&st.anim==='custom'?st:null;};
    const moKind=x=>{const st=moDrv(x);if(!st)return '';const P=moOf(st).pp;
      return P.every(p=>p==='fr')?'fr':P.some(p=>TF_K.indexOf(p)>=0)?'tf':P.every(p=>MO_FAM[p]==='s')?'fc':'op';};
    const bKind=x=>x&&x.p==='mo'?moKind(x):x&&x.p;
    const bindTf=x=>isBind(x)&&(/^m[xyrs]$/.test(x.p)||moKind(x)==='tf');
    const numOr=(v,d)=>v!==''&&v!=null&&isFinite(+v)?+v:d;
    const bindIn=x=>[numOr(x.i0,0),numOr(x.i1,100)];
    function bindOut(x){
      const d=BIND_O[x.p],c=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
      if(x.p==='fc')return [c(x.o0)?x.o0:d[0],c(x.o1)?x.o1:d[1]];
      return [numOr(x.o0,d[0]),numOr(x.o1,d[1])];
    }
    const bindA=(x,j)=>clamp(numOr(x[j?'oa1':'oa0'],1),0,1);
    const bindTm=x=>clamp(Math.round(numOr(x.tm,600)),0,10000);
    const bindVar=r=>'--zv-r'+rNum(r);
    const hexRgb=h=>{const n=parseInt(String(h||'').slice(1),16)||0;return [n>>16&255,n>>8&255,n&255];};
    function bindD(x){const st=stById(+x.an),T=st&&AN[st.anim];return T?anNum(st.ad,.05,600,T.d):1;}
    function bindAt(x,v){
      const I=bindIn(x),t=isNaN(v)?0:clamp((v-I[0])/((I[1]-I[0])||1),0,1);
      if(x.p==='fc')return t;
      const O=bindOut(x);return O[0]+t*(O[1]-O[0]);
    }
    const NUM_DOM=['sensor','input_number','number','counter'];
    const BOOL_1=['on','open','true','home'],BOOL_0=['off','closed','false','not_home'];
    const bindWords=k=>!!k&&!k.a&&!!k.e&&NUM_DOM.indexOf(entDom(k.e))<0;
    function bindJS(k,x,r){
      const val=k.a?"(entity.attributes || {})['"+jsq(k.a)+"']":'entity.state',I=bindIn(x),V=bindVar(r),q6=v=>+(+v).toFixed(6);
      const w=L=>L.map(q=>"s === '"+q+"'").join(' || ');
      const b=(bindWords(k)?['var s = String('+val+');','var v = '+w(BOOL_1)+' ? 1 : '+w(BOOL_0)+' ? 0 : parseFloat(s);']:['var v = parseFloat('+val+');'])
        .concat(['var t = isNaN(v) ? 0 : Math.min(1, Math.max(0, (v - ('+q6(I[0])+')) / ('+(q6(I[1]-I[0])||1)+')));']);
      if(x.p==='mo'){b.push("return '"+V+": ' + t.toFixed(4) + ';';");return b;}
      if(x.p==='fc'){
        const O=bindOut(x),c0=hexRgb(O[0]),c1=hexRgb(O[1]),a0=bindA(x,0),a1=bindA(x,1),m=(q,w)=>'('+q6(q)+' + t * ('+q6(w-q)+'))';
        b.push("return '"+V+": rgba(' + Math.round"+m(c0[0],c1[0])+" + ', ' + Math.round"+m(c0[1],c1[1])+" + ', ' + Math.round"+m(c0[2],c1[2])+" + ', ' + "+m(a0,a1)+".toFixed(2) + ');';");
        return b;
      }
      const O=bindOut(x);
      b.push('var o = '+q6(O[0])+' + t * ('+q6(O[1]-O[0])+');');
      if(x.p==='sp'){
        const D=bindD(x);
        b.push("return o <= 0 ? '"+V+": "+D+"s; "+V+"p: paused;' : '"+V+": ' + ("+D+" * 100 / o).toFixed(3) + 's; "+V+"p: running;';");
        return b;
      }
      if(x.p==='fv'){
        b.push("return o === 0 ? '"+V+": 1; "+V+"d: normal; "+V+"p: paused;' : '"+V+": ' + Math.abs(o).toFixed(3) + '; "+V+"d: ' + (o < 0 ? 'reverse' : 'normal') + '; "+V+"p: running;';");
        return b;
      }
      if(x.p==='ms')b.push("return '"+V+": ' + (o / 100).toFixed(4) + ';';");
      else b.push("return '"+V+": ' + o.toFixed(4) + '"+(x.p==='mr'||x.p==='fr'?'deg':x.p==='op'||x.p==='gp'?'':'px')+";';");
      return b;
    }
    function bindVal(r,live){
      const k=rCs(r)[0],x=rFol(r);if(!k||!isBind(x)||!k.e)return null;
      const st=simStates(live)[k.e];if(!st)return null;
      const s=fxRun(bindJS(k,x,r),st);if(s==null)return null;
      const m=new RegExp(bindVar(r)+':\\s*([^;]+);').exec(String(s));
      return m?{v:m[1].trim(),paused:/p: paused;/.test(String(s)),rev:/d: reverse;/.test(String(s))}:null;
    }
    const moTw=new Map();let moTwRaf=0;
    function moTwAt(r,t,d,live){
      const now=performance.now();let w=moTw.get(r.id);
      if(!w||w.live!==live){moTw.set(r.id,{a:t,b:t,t0:now,d:0,live:live});return t;}
      if(w.b!==t){w={a:moTwVal(w,now),b:t,t0:now,d:d,live:live};moTw.set(r.id,w);}
      const v=moTwVal(w,now);
      if(v!==w.b&&!moTwRaf)moTwRaf=requestAnimationFrame(()=>{moTwRaf=0;draw();});
      return v;
    }
    function moTwVal(w,now){const k=w.d>0?(now-w.t0)/w.d:1;return k>=1?w.b:w.a+(w.b-w.a)*cssEase(k);}
    const CSS_BZ={ease:[0.25,0.1,0.25,1],linear:[0,0,1,1],'ease-in':[0.42,0,1,1],'ease-out':[0,0,0.58,1],'ease-in-out':[0.42,0,0.58,1]};
    function cssEase(k,e){
      const P=CSS_BZ[e]||CSS_BZ.ease;if(e==='linear')return k;
      const B=(p,q,u)=>3*p*u*(1-u)*(1-u)+3*q*u*u*(1-u)+u*u*u;
      let lo=0,hi=1,u=k;for(let i=0;i<24;i++){u=(lo+hi)/2;if(B(P[0],P[2],u)<k)lo=u;else hi=u;}
      return B(P[1],P[3],u);
    }
    const moVal=(M,p,t)=>{const n=moAt(M,p,t);return MO_A[p]?moColAt(M,t,p):p==='mx'||p==='my'||p==='fs'||p==='ls'?f(n)+'px':p==='mr'||p==='fr'?f(n)+'deg':p==='ms'?String(f(n/100)):String(f(n));};
    function bindsOf(s){
      const own={},grp={};
      if(amSt.size&&flow&&flCv){
        const put=(id,D,g)=>{
          const r=ruleOf(tapMv.get(id)),v=r&&actMo(r);if(!moGo(v))return;
          mvMos(v).forEach(st=>{const M=moOf(st),t=amVal(id,st)*100,pv=moPv(st)||'c';
            M.pp.forEach(p=>{if(D[p]||p==='fr')return;D[p]={r:r,x:{p:p,pv:pv,tm:0,ay:p==='ms'?st.ay:undefined},g:g||undefined,val:{v:moVal(M,p,t)},gs:true};});});
        };
        put(s.id,own);chainOf(s).forEach(g=>put(g,grp,g));
      }
      if(!RULS().some(r=>isBind(rFol(r))))return {own:own,grp:grp};
      const C=chainOf(s),live=cvLive();
      RULS().forEach(r=>{
        if(rKind(r)!=='data'||!rOk(r))return;const x=rFol(r);if(!isBind(x))return;
        const O=rOn(r),g=O.indexOf(s.id)>=0?null:O.find(id=>C.indexOf(id)>=0),D=g?grp:own;
        if(!g&&O.indexOf(s.id)<0)return;
        if(x.p==='mo'){
          const st=moDrv(x);if(!st)return;const v=bindVal(r,live);if(!v)return;
          const M=moOf(st),t=moTwAt(r,clamp(parseFloat(v.v)||0,0,1),bindTm(x),live)*100,pv=moPv(st)||'c';
          M.pp.forEach(p=>{
            if(D[p])return;const n=moAt(M,p,t);
            const w=MO_A[p]?moColAt(M,t,p):p==='mx'||p==='my'||p==='fs'||p==='ls'?f(n)+'px':p==='mr'||p==='fr'?f(n)+'deg':p==='ms'?String(f(n/100)):String(f(n));
            D[p]={r:r,x:{p:p,pv:pv,tm:x.tm,ay:p==='ms'?st.ay:undefined},g:g||undefined,val:{v:w}};
          });
          return;
        }
        if(!D[x.p]){const v=bindVal(r,live);if(v)D[x.p]=g?{r:r,x:x,g:g,val:v}:{r:r,x:x,val:v};}
      });
      return {own:own,grp:grp};
    }
    function bindGuessIn(k){
      const h=self._hass,st=h&&h.states&&k&&h.states[k.e],A=st&&st.attributes||{};
      if(k&&k.a==='brightness')return [0,255];
      if(st&&!k.a&&isFinite(parseFloat(A.min))&&isFinite(parseFloat(A.max)))return [+A.min,+A.max];
      return [0,100];
    }
    function anOfObj(s){
      const a=stysOf(s).filter(isAn).map(x=>x.id);
      RULS().forEach(r=>{if(!rHas(r,s))return;(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{const L=x&&(x.k==='look'||x.k==='act')?x.sty:x&&x.k==='mv'?x.mo:null;if(Array.isArray(L))L.forEach(id=>{if(isAn(stById(id))&&a.indexOf(id)<0)a.push(id);});});});
      return a;
    }
    const actSvc=e=>{const d=entDom(e);return d==='button'?'button.press':d==='script'?'script.turn_on':d+'.toggle';};
    const ENT_OK=/^[a-z_]+\.[a-z0-9_]+$/;
    function svcVal(s){
      s=s.trim();if(!s)return undefined;
      if(/^\[.*\]$/.test(s)){
        const b=s.slice(1,-1).trim();if(!b)return [];
        const a=b.split(',').map(svcVal);return a.some(v=>v===undefined||Array.isArray(v))?undefined:a;
      }
      if(s.length>1&&(s[0]==='"'&&s.slice(-1)==='"'||s[0]==="'"&&s.slice(-1)==="'"))return s.slice(1,-1);
      if(/^(true|false)$/i.test(s))return s.toLowerCase()==='true';
      if(/^-?\d+(\.\d+)?$/.test(s))return +s;
      return s;
    }
    function svcData(t){
      const o={};let bad=0;
      String(t||'').split(/\r?\n/).forEach((l,i)=>{
        const s=l.trim();if(bad||!s||s[0]==='#')return;
        const m=/^([A-Za-z_][A-Za-z0-9_]*)\s*:(.*)$/.exec(s),v=m?svcVal(m[2]):undefined;
        if(v===undefined){bad=i+1;return;}
        o[m[1]]=v;
      });
      return {o:o,bad:bad};
    }
    const TAP_G=['tap','swl','swr','swu','swd'],ACT_A=['toggle','info','sty','svc','page','nav',''];
    const SW_G=TAP_G.slice(1),SW_D={swl:'l',swr:'r',swu:'u',swd:'d'},SW_L={swl:'Swipe left',swr:'Swipe right',swu:'Swipe up',swd:'Swipe down'},SW_A={swl:'←',swr:'→',swu:'↑',swd:'↓'};
    const tapG=k=>k&&k.k==='tap'&&TAP_G.indexOf(k.g)>0?k.g:'tap';
    const rGest=r=>tapG(rCs(r)[0]);
    const SW_PX=40,SW_MS=800,SW_K=1.5;
    const swDir=(dx,dy,ms)=>{const ax=Math.abs(dx),ay=Math.abs(dy);if(ms>SW_MS||Math.max(ax,ay)<SW_PX||Math.max(ax,ay)<SW_K*Math.min(ax,ay))return '';return ax>ay?(dx<0?'swl':'swr'):(dy<0?'swu':'swd');};
    const actA=x=>!x?'':'a' in x?(x.a==='toggle'?'toggle':x.a):'toggle';
    const ACT_L={toggle:'Switch',info:'More info',sty:'Apply style',mo:'Apply motion',svc:'Call service',page:'Go to page',nav:'Navigate'};
    const NAV_OK=/^\/\S*$/;
    const PG_TT=['none','fade','slide','zoom','rotate'];
    const PG_DIR={slide:[['l','←'],['r','→'],['u','↑'],['d','↓']],rotate:[['y','↔'],['x','↕']]};
    function pgTr(x){
      const t=x&&PG_TT.indexOf(x.tt)>=0?x.tt:'none',D=PG_DIR[t],d=D?(D.some(q=>q[0]===x.tdir)?x.tdir:D[0][0]):'';
      const v=Math.round(+(x&&x.tms)),ms=isFinite(v)&&v>0?clamp(v,50,5000):600;
      return {t:t,d:d,ms:ms,tok:t==='none'?'none':t+(d?'-'+d:'')+'-'+ms,lab:t==='none'?'no transition':t+(d?' '+D.find(q=>q[0]===d)[1]:'')+' · '+ms+' ms'};
    }
    function pgTrFields(k,T,act){
      const D=T&&PG_DIR[T.t],v=T?T.t:act?'':'none';
      return '<select class="num" data-'+k+'="tt" aria-label="Transition" style="width:auto">'+
          (act?'<option value=""'+(v===''?' selected':'')+'>as page</option>':'')+
          PG_TT.map(q=>'<option value="'+q+'"'+(q===v?' selected':'')+'>'+q+'</option>').join('')+'</select>'+
        (D?'<select class="num" data-'+k+'="tdir" aria-label="Direction" style="width:auto">'+D.map(q=>'<option value="'+q[0]+'"'+(q[0]===T.d?' selected':'')+'>'+q[1]+'</option>').join('')+'</select>':'')+
        (T&&T.t!=='none'?'<span><input class="num" data-'+k+'="tms" type="number" min="50" max="5000" step="50" style="width:64px" aria-label="Duration" value="'+T.ms+'"> ms</span>':'');
    }
    const pgTrOf=x=>pgTr(x&&PG_TT.indexOf(x.tt)>=0?x:pgOf(x&&x.pg));
    function pgFrames(T,A,o){
      const P='perspective(1600px) ',w=A.w,h=A.h;
      const tr=(x,y)=>({transform:'translate('+x+'px, '+y+'px)'}),Z=tr(0,0);
      const sl={l:[w,0,-w,0],r:[-w,0,w,0],u:[0,h,0,-h],d:[0,-h,0,h]};
      let F;
      if(T.t==='fade')F=o?[{opacity:1},{opacity:0}]:[{opacity:0},{opacity:1}];
      else if(T.t==='slide'){const q=sl[T.d];F=o?[Z,tr(q[2],q[3])]:[tr(q[0],q[1]),Z];}
      else if(T.t==='zoom')F=o?[{transform:'scale(1)',opacity:1},{transform:'scale(1.15)',opacity:0}]:[{transform:'scale(0.6)',opacity:0},{transform:'scale(1)',opacity:1}];
      else{const ax=T.d==='x'?'rotateX':'rotateY',g=T.d==='x'?-1:1;F=o?[{transform:P+ax+'(0deg)'},{transform:P+ax+'('+(90*g)+'deg)'}]:[{transform:P+ax+'('+(-90*g)+'deg)'},{transform:P+ax+'(0deg)'}];}
      if(o)F[1]=Object.assign({},F[1],{visibility:'hidden'});
      return F;
    }
    const pgTime=(T,o)=>T.t==='rotate'?{d:Math.round(T.ms/2),w:o?0:Math.round(T.ms/2)}:{d:T.ms,w:0};
    const SVC_OK=/^[a-z_]+\.[a-z0-9_]+$/;
    const TAP_DOM=['light','switch','fan','input_boolean'],TAP_DOM2=['cover','media_player','humidifier','siren','automation','group','remote','climate'];
    const jsq=v=>String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    function followJS(k,x){
      const val=k.a?"(entity.attributes || {})['"+jsq(k.a)+"']":'entity.state';
      if(x.p==='text'){
        const b=['var v = '+val+';',"if (v === undefined || v === null) v = '—';"];
        if(x.dec!=null&&x.dec>=0)b.push('var n = parseFloat(v);','if (!isNaN(n)) v = n.toFixed('+x.dec+');');
        b.push("return '"+jsq(x.pre||'')+"' + v + '"+jsq(x.suf||'')+"';");
        return b;
      }
      if(x.map==='onoff')return ["return '--zv: ' + (String("+val+") === 'on' ? 1 : 0) + ';';"];
      if(x.map==='value')return ['var v = parseFloat('+val+');',"return '--zv: ' + (isNaN(v) ? 0 : Math.min(1, Math.max(0, v))) + ';';"];
      return ["if (entity.state !== 'on') return '--zv: 0;';",'var b = entity.attributes.brightness;',"return '--zv: ' + (b ? b / 255 : 1) + ';';"];
    }
    function fxRun(lines,st){
      const key='F'+lines.join('\n');
      let fn=jsFn.get(key);
      if(fn===undefined){
        try{fn=new Function('entity','"use strict";\n'+lines.join('\n'));}catch(_){fn=null;}
        jsFn.set(key,fn);
      }
      if(!fn||!st)return null;
      try{return fn({state:st.state,attributes:st.attributes||{}});}catch(_){return null;}
    }
    const rFol=r=>fxOf(r,'follow');
    const folFits=(x,s)=>x&&(isBind(x)||(x.p==='text'?s.t==='label':x.ph?phAll(s).some(I=>I.p&&phName(s,I)===x.ph):hasImg(s)));
    function phFits(x,s,I){const A=phAll(s);I=I||A[0];return !!I&&(x.ph?phName(s,I)===x.ph:A.indexOf(I)===0);}
    function folRule(s,p,I){
      if(GM){const T=mem('fo',s,()=>new Map());let U=T.get(p);if(!U)T.set(p,U=new Map());if(!U.has(I))U.set(I,folRule0(s,p,I));return U.get(I);}
      return folRule0(s,p,I);
    }
    function folRule0(s,p,I){
      return RULS().find(r=>rKind(r)==='data'&&rFol(r)&&rFol(r).p===p&&rOk(r)&&rObjs(r).indexOf(s)>=0&&(p!=='opacity'||phFits(rFol(r),s,I)))||null;
    }
    function folNow(s,p,I){
      const r=folRule(s,p,I);if(!r)return null;
      const k=rCs(r)[0],st=simStates(cvLive()||p==='text')[k.e];if(!st)return null;
      const v=fxRun(followJS(k,rFol(r)),st);
      if(p==='text')return v==null?null:String(v);
      const m=/--zv:\s*([-0-9.e]+)/.exec(String(v));
      return m&&isFinite(+m[1])?clamp(+m[1],0,1):null;
    }
    function symNow(s){
      const r=RULS().find(q=>rKind(q)==='cond'&&rSymI(q)&&rObjs(q).indexOf(s)>=0&&rCanvas(q));
      return r?rSymI(r):s.icon;
    }
    function actRule(s){return gstRule(s,'tap');}
    function gstRule(s,g){return gstRules(s,g)[0]||null;}
    function gstRules(s,g){return mem('ar'+g,s,()=>RULS().filter(r=>rKind(r)==='tap'&&rGest(r)===g&&rOk(r)&&(isCard(s)?rOn(r).indexOf(s.id)>=0:rObjs(r).indexOf(s)>=0)));}
    function tapPlan(s,g){return mem('tp'+g,s,()=>{
      let lv=null,inf=null;const mo=new Map();
      return gstRules(s,g).map(r=>{
        let a=fxOf(r,'act'),mv=actMo(r);const A=actA(a),ig=[];
        if(a&&(A==='page'||A==='nav')){if(lv){ig.push({k:'pg',by:lv});a=null;}else lv=r;}
        else if(a&&A==='info'){if(inf){ig.push({k:'info',by:inf});a=null;}else inf=r;}
        if(mv){
          const T=mv.to||[],to=T.filter(id=>{const b=mo.get(id);if(b){ig.push({k:'mv',by:b,id:id});return false;}mo.set(id,r);return true;});
          mv=!to.length?null:to.length<T.length?Object.assign({},mv,{to:to}):mv;
        }
        return {r:r,a:a,mv:mv,ig:ig};
      });
    });}
    const tapIgn=()=>mem('tig',0,()=>{
      const M=new Map();
      S.objects.forEach(s=>{if(!gstOut(s))return;TAP_G.forEach(g=>tapPlan(s,g).forEach(q=>q.ig.forEach(x=>{
        const o=x.id?tgtOf(x.id):null,t='ignored '+(SW_A[g]?'on swipe '+SW_A[g]:'on tap')+': “'+rName(x.by)+'” '+
          (x.k==='pg'?'already goes to a page':x.k==='info'?'already opens a more-info':'already moves “'+(o?o.n||o.id:x.id)+'”');
        const L=M.get(q.r.id)||[];if(L.indexOf(t)<0)L.push(t);M.set(q.r.id,L);
      })));});
      return M;
    });
    const rIgn=r=>tapIgn().get(r.id)||[];
    const ignTri=L=>L.length?'<span class="rig" title="'+esc(L.join('\n'))+'"><svg viewBox="-10 -10 20 18" width="13" height="12" aria-hidden="true"><path d="M0-9L9 7H-9z" fill="#F2B544" stroke="#5A3A00" stroke-width="1"/><path d="M0-3v4M0 4v.01" stroke="#3A2600" stroke-width="1.8" stroke-linecap="round"/></svg></span>':'';
    const gstSw=s=>SW_G.some(g=>!!gstRule(s,g));
    const gstAny=s=>!!actRule(s)||gstSw(s);
    const actSty=r=>{const x=fxOf(r,'act');return x&&actA(x)==='sty'?x:null;};
    const anFin=st=>{if(!stHas(st,'a'))return false;const A=anOf(st,stState(st,'n')||Object.assign({},ST_P),'z');return !!A&&!/\binfinite\b/.test(A.sh);};
    const tapRe=r=>{const x=actSty(r);return !!x&&idsStys(x.sty).some(anFin);};
    const styUsed=r=>mem('su',r,()=>rKind(r)==='tap'&&rOk(r)&&S.objects.some(s=>gstOut(s)&&gstRules(s,rGest(r)).indexOf(r)>=0));
    const gstOut=s=>(!isEl(s)||expEl(s))&&(!isCard(s)||!!cdCfg(s));
    const actMo=r=>fxOf(r,'mv');
    const moGo=x=>!!x&&x.md==='g';
    const moPt=x=>clamp(Math.round(numOr(x&&x.pt,100)),0,100);
    const mvMos=x=>idsStys(x&&x.mo).filter(st=>isAn(st)&&(!moGo(x)||st.anim==='custom'));
    const mvRe=x=>!moGo(x)&&mvMos(x).some(anFin);
    const moDur=st=>Math.round(anNum(st.ad,.05,600,AN.custom.d)*1000);
    const moEase=st=>AN_E.indexOf(st.ae)>=0?st.ae:AN.custom.e;
    const tapLys=()=>mem('tl',0,()=>{
      const L=[];
      RULS().forEach(r=>{
        if(rKind(r)!=='tap'||!styUsed(r))return;
        const n=rNum(r),a=actSty(r),v=actMo(r);
        if(a)L.push({r:r,x:a,key:'[data-t'+n+']',ak:'data-t'+n,re:tapRe(r),m:false});
        if(v&&!moGo(v))L.push({r:r,x:{sty:mvMos(v).map(st=>st.id),to:v.to||[]},key:'[data-m|="'+n+'"]',ak:'data-m',re:mvRe(v),m:true});
      });
      return L;
    });
    const amGoR=()=>mem('ag0',0,()=>RULS().filter(r=>rKind(r)==='tap'&&moGo(actMo(r))&&styUsed(r)&&mvMos(actMo(r)).length>0));
    const amMvOn=id=>amGoR().some(r=>(actMo(r).to||[]).indexOf(id)>=0&&mvMos(actMo(r)).some(anTf));
    function tapReplay(r,x){
      x=x||actSty(r);if(!x||!flow||!flCv)return;
      const ids=stIds(),F=idsStys(x.sty).filter(anFin),P=F.map(st=>'ed-anim-'+ids.get(st.id)+'-'),O=new Set();
      const Q=F.map(st=>new RegExp('\\bed-pc-[\\w.-]*-'+ids.get(st.id)+'(?![\\w-])'));
      (x.to||[]).forEach(id=>{const o=tgtOf(id);if(!o)return;O.add(id);if(isGrp(o))members(id).forEach(q=>O.add(q.id));});
      const E=[];
      cv.querySelectorAll('[data-i]').forEach(e=>{const q=S.objects[+e.dataset.i];if(q&&O.has(q.id))E.push(e.closest('g')||e);});
      S.objects.forEach((q,i)=>{const fr=O.has(q.id)&&gShapes.children[i];if(fr&&E.indexOf(fr)<0)E.push(fr);});
      O.forEach(id=>{const o=cdN.get(id);if(o)E.push(o.sb);});
      E.forEach(e=>[e].concat([...e.querySelectorAll('*')]).forEach(n=>{
        const v=n.style&&n.style.animation;if(!v||/\binfinite\b/.test(v)||!P.some(p=>v.indexOf(p)>=0)&&!Q.some(q=>q.test(v)))return;
        n.style.animation='none';void getComputedStyle(n).animationName;n.style.animation=v;
      }));
    }
    const tapLit=new Set();
    const tapMv=new Map(),amSt=new Map();let amRaf=0;
    function litLys(){
      const L=[];if(!(flow&&flCv)||!tapLit.size&&!tapMv.size)return L;
      RULS().forEach(r=>{
        const a=tapLit.has(r.id)&&actSty(r),v=actMo(r);
        if(a)L.push({r:r,x:a});
        if(v&&!moGo(v)){const to=(v.to||[]).filter(id=>tapMv.get(id)===r.id);if(to.length)L.push({r:r,x:{sty:mvMos(v).map(st=>st.id),to:to}});}
      });
      return L;
    }
    function tapLay(T){
      const L=[];
      if(!(flow&&flCv)){if(tapLit.size)tapLit.clear();if(tapMv.size)tapMv.clear();if(amSt.size)amSt.clear();return L;}
      litLys().slice().reverse().forEach(q=>{const x=q.x;if((x.to||[]).some(id=>T.indexOf(id)>=0))L.push(...idsStys(x.sty));});
      return L;
    }
    function amVal(id,st){
      const w=amSt.get(id+'|'+st.id);if(!w)return 0;
      const now=performance.now(),k=w.d>0?(now-w.t0)/w.d:1;
      if(k>=1)return w.b;
      if(!amRaf)amRaf=requestAnimationFrame(()=>{amRaf=0;draw();});
      return w.a+(w.b-w.a)*cssEase(k,w.e);
    }
    function amTap(r,v){
      const ids=new Set(),now=performance.now(),go=moGo(v),M=mvMos(v);
      (v.to||[]).forEach(id=>{const o=tgtOf(id);if(!o)return;ids.add(id);if(isGrp(o))members(id).forEach(q=>{if(isCard(q))ids.add(q.id);});});
      ids.forEach(id=>{
        tapMv.set(id,r.id);
        [...amSt.keys()].forEach(k=>{if(k.split('|')[0]===id&&!(go&&M.some(st=>k===id+'|'+st.id)))amSt.delete(k);});
        if(go)M.forEach(st=>{const a=amVal(id,st),b=moPt(v)/100;amSt.set(id+'|'+st.id,{a:a,b:b,t0:now,d:a===b?0:moDur(st),e:moEase(st)});});
      });
      if(!go&&mvRe(v))requestAnimationFrame(()=>requestAnimationFrame(()=>tapReplay(r,{sty:M.map(st=>st.id),to:v.to||[]})));
    }
    function rProblems(r){return mem('rp',r,()=>rProblems0(r));}
    function rProblems0(r){
      const p=[],k=rKind(r),O=rObjs(r);
      if(!k||k==='cond'){
        if(!rCs(r).some(causeJS))p.push('no condition with an entity');
        const st=idsStys(rSty(r)).length,sy=rSymI(r),ph=fxOf(r,'pho');
        if(!st&&!sy&&!(ph&&ph.n))p.push('no style');
        else if(!st&&sy&&!O.some(s=>s.t==='icon'))p.push('no icon for the symbol');
        if(ph&&ph.n&&O.length&&!O.some(s=>phAll(s).some(I=>I.p&&phName(s,I)===ph.n)))p.push('no target zone has a photo named “'+ph.n+'”');
      }
      else if(k==='data'){
        if(!rCs(r)[0].e)p.push('no entity');
        const x=rFol(r);
        if(!x)p.push('no effect');
        else if(x.p==='mo'&&!moDrv(x))p.push('no motion');
        else if(bKind(x)==='fr'){if(O.length&&!O.some(s=>pfCon(s).length))p.push('no target has a conic fill');}
        else if(x.p==='fv'||x.p==='gp'){if(O.length&&!O.some(isLn))p.push('no line among the targets');}
        else if(x.p==='sp'){
          if(!isAn(stById(+x.an)))p.push('no motion');
          else if(O.length&&!O.some(s=>anOfObj(s).indexOf(+x.an)>=0))p.push('no target has this motion');
        }
        else if(rOn(r).some(tgtOf)&&!O.some(s=>folFits(x,s)))p.push(x.p==='text'?'no label among the targets':'no zone with a photo among the targets'+(O.some(s=>s.t==='label')?' (a value on a label is set from its Settings)':''));
      }
      else if(k==='tap'){
        const x=fxOf(r,'act'),a=actA(x),v=actMo(r);
        if(v){
          if(!mvMos(v).length)p.push(moGo(v)&&idsStys(v.mo).length?'no motion with poses':'no motion');
          if(a!=='sty'&&!(v.to||[]).some(tgtOf))p.push('no object to move');
        }
        if(!a){if(!v)p.push('no action');}
        else if(a==='toggle'||a==='info'){if(!ENT_OK.test(x.e||''))p.push('no entity for the action');}
        else if(a==='sty'){
          if(!idsStys(x.sty).length)p.push('no style');
          if(!(x.to||[]).some(tgtOf))p.push('no object to style');
        }
        else if(a==='page'){if(!pgOf(x.pg))p.push('no page');}
        else if(a==='nav'){if(!NAV_OK.test(x.u||''))p.push('no address');}
        else{
          if(!SVC_OK.test(x.svc||''))p.push('no service');
          if(x.e&&!ENT_OK.test(x.e))p.push('the entity is not valid');
          const d=svcData(x.d);if(d.bad)p.push('data line '+d.bad+' not understood');
        }
      }
      if(!rOn(r).some(id=>tgtOf(id)&&(k==='cond'||!k||!bgOf(id))))p.push('no target');
      if(spOut&&rSpUse(r))p.push('placeholder not linked');
      return p;
    }
    function rSpUse(r){
      if(rCs(r).some(k=>isSp(k.e)))return true;
      const x=fxOf(r,'act');
      return !!x&&(isSp(x.e)||typeof x.d==='string'&&SP_IN.test(x.d));
    }
    function spUsed(){
      const U=new Set(),add=t=>{(String(t).match(/ada_studio\.[a-z0-9_]+/g)||[]).forEach(e=>U.add(e));};
      CAUS().forEach(k=>{if(isSp(k.e))U.add(k.e);});
      RULS().forEach(r=>{const x=fxOf(r,'act');if(x){if(isSp(x.e))U.add(x.e);if(typeof x.d==='string')add(x.d);}});
      S.objects.forEach(o=>{if(isCard(o)&&o.cfg)add(JSON.stringify(o.cfg));});
      return U;
    }
    const rOk=r=>!rProblems(r).length;
    const opSym=op=>(EV_OPS.find(o=>o[0]===op)||['',op||''])[1];
    function cAuto(k){
      if(k.k==='tap')return SW_L[tapG(k)]||'Tap';
      if(k.k==='data')return k.e?'Value of '+k.e+(k.a?' · '+k.a:''):'New data';
      if(!k.e)return 'New condition';
      return k.e+(k.a?' · '+k.a:'')+' '+opSym(k.op)+' '+(k.v==null?'':k.v)+(k.op==='btw'?' and '+(k.v2==null?'':k.v2):'');
    }
    const cName=k=>(k.n&&String(k.n).trim())||cAuto(k);
    const rAuto=r=>{
      const T=rOn(r).map(tgtOf).filter(Boolean),X=(Array.isArray(r.fx)?r.fx:[]).filter(x=>x&&!fxVoid(x));
      if(!T.length&&!X.length)return r===drR?'New rule':'Rule '+rNum(r);
      const t=T.length?(T[0].n||'(unnamed)')+(T.length>1?' +'+(T.length-1):''):'no target';
      return t+' → '+(X.map(x=>x.k==='look'?idsStys(x.sty).map(q=>q.n||'(unnamed)').join(' + '):fxHid(x)?'value':x.k==='pho'?'photo '+(x.n||'?'):fxLabel(x)).join(', ')||'no effect');
    };
    const rName=r=>(r.n&&String(r.n).trim())||rAuto(r);
    const cUsers=k=>RULS().filter(r=>Array.isArray(r.c)&&r.c.indexOf(k.id)>=0);
    function rulesOn(o){
      const T=isGrp(o)?chainG(o.id):[o.id].concat(chainOf(o));
      return RULS().filter(r=>rOn(r).some(id=>T.indexOf(id)>=0));
    }
    function joinRules(a,b){RULS().forEach(r=>{if(Array.isArray(r.on)&&r.on.indexOf(a)>=0&&r.on.indexOf(b)<0)r.on.push(b);});}
    function newCause(kind,e,g){
      if(!Array.isArray(S.causes))S.causes=[];
      if(kind==='tap'){const t=tapCause(g);if(t)return t;}
      const id=newId('c',S.causes);
      const k=kind==='tap'?tapNew(id,g):kind==='data'?{id:id,k:'data',e:e||''}:{id:id,k:'cond',e:'',op:'=',v:''};
      S.causes.push(k);return k;
    }
    const tapNew=(id,g)=>SW_L[g]?{id:id,k:'tap',g:g}:{id:id,k:'tap'};
    const tapCause=g=>CAUS().find(k=>k.k==='tap'&&tapG(k)===(g||'tap'))||null;
    function fxFor(r,kind){
      if(kind==='tap')return {k:'act',a:''};
      if(kind==='data')return {k:'follow',p:'mo'};
      return {k:'look',sty:[]};
    }
    function rAddCause(r,k){
      if(!k||r.c.indexOf(k.id)>=0)return;
      const was=rKind(r);
      if(was&&(was!=='cond'||k.k!=='cond'))return;
      r.c.push(k.id);
      if(!was){
        const ok=FX_OK[k.k];
        r.fx=(Array.isArray(r.fx)?r.fx:[]).filter(x=>x&&ok[x.k]);
        if(!r.fx.length)r.fx.push(fxFor(r,k.k));
      }
    }
    function newRule(on){
      if(!Array.isArray(S.rules))S.rules=[];
      const r={id:newId('r',S.rules),c:[],fx:[{k:'look',sty:[]}],on:on||[]};
      S.rules.push(r);return r;
    }
    function drNew(on){
      if(drR&&JSON.stringify(drR)!==drR0&&!confirm('Discard the new rule you are writing?'))return null;
      drR={id:'xr'+(++drN),c:[],fx:[{k:'look',sty:[]}],on:(on||[]).slice()};drR0=JSON.stringify(drR);drK=[];
      if(drC&&drC.r&&!ruleOf(drC.r))drC=null;
      return drR;
    }
    function drCNew(r,kind){
      const id='xc'+(++drN);
      drC={r:r?r.id:'',k:kind==='data'?{id:id,k:'data',e:''}:{id:id,k:'cond',e:'',op:'=',v:''}};
      return drC.k;
    }
    const cNewOk=k=>{const h=self._hass;return !!k&&cDone(k)&&(k.k==='tap'||!(h&&h.states)||!!h.states[k.e]);};
    function drCOk(){
      const P=drC;if(!P||!cNewOk(P.k))return;
      const r=P.r?ruleOf(P.r):null,k=P.k;
      drC=null;
      if(P.r&&!r){render();return;}
      if(r&&r===drR){drK.push(k);rAddCause(r,k);render();return;}
      settle();
      if(!Array.isArray(S.causes))S.causes=[];
      k.id=newId('c',S.causes);S.causes.push(k);
      if(r)rAddCause(r,k);
      else{ruCur=k.id;if(flow&&flFoc&&flFoc.k==='c'){flFoc={k:'c',id:k.id};flOpen='c:'+k.id;flRu=k.id;}}
      render();store(true);
    }
    function drCX(){
      const P=drC;drC=null;
      if(P&&!P.r&&ruCur===P.k.id){ruCur='';if(flow&&flFoc&&flFoc.id===P.k.id){flFoc=null;flOpen='';flPanel=false;}}
      render();
    }
    function drROk(){
      const r=drR;if(!r||drC&&drC.r===r.id||!rOk(r))return;
      settle();
      if(!Array.isArray(S.causes))S.causes=[];
      if(!Array.isArray(S.rules))S.rules=[];
      r.c=r.c.map(id=>{
        const k=drK.find(q=>q.id===id);if(!k)return id;
        const t=k.k==='tap'&&tapCause(tapG(k));if(t)return t.id;
        k.id=newId('c',S.causes);S.causes.push(k);return k.id;
      }).filter((id,i,a)=>a.indexOf(id)===i);
      r.id=newId('r',S.rules);S.rules.push(r);
      drR=null;drR0='';drK=[];ruCur=r.id;
      if(flow&&flFoc&&flFoc.k==='r'){flFoc={k:'r',id:r.id};flRu=r.id;}
      render();store(true);stamp('rule created');
    }
    function drRX(){
      if(!drR)return;
      const id=drR.id;drR=null;drR0='';drK=[];
      if(drC&&drC.r===id)drC=null;
      if(ruCur===id)ruCur='';
      if(flow&&flFoc&&flFoc.id===id){flFoc=null;flPanel=false;}
      render();
    }
    function drFix(){if(drC&&drC.r&&!ruleOf(drC.r))drC=null;}
    function lvProp(e,a){
      const h=self._hass,st=h&&h.states&&e?h.states[e]:null,o={};
      if(!st||a)return o;
      const A=st.attributes||{},v=String(st.state);
      if(v.trim()===''||!isFinite(+v))return o;
      if(A.unit_of_measurement)o.suf=' '+A.unit_of_measurement;
      const d=(v.split('.')[1]||'').length;
      if(A.device_class==='temperature')o.dec=1;else if(d)o.dec=Math.min(d,2);
      return o;
    }
    function cValOffer(k){
      if(!k||k.k!=='cond'||!k.e||k.op!=='='||String(k.v==null?'':k.v)!=='')return null;
      const U=cUsers(k);if(U.length!==1)return null;
      const r=U[0],O=rObjs(r);
      if(r.c.length!==1||rSty(r).length||rSymI(r)||!O.length||O.some(s=>s.t!=='label'))return null;
      return r;
    }
    function cToValue(k){
      const r=cValOffer(k);if(!r)return false;
      k.k='data';['op','v','v2'].forEach(q=>{delete k[q];});
      r.fx=[Object.assign({k:'follow',p:'text'},lvProp(k.e,k.a))];
      return true;
    }
    function selUnitIds(){
      if(selGrp!=null&&grpOf(selGrp))return [selGrp];
      const u=selUnits(ms.slice());
      return u.fg.concat(u.loose.map(q=>q.id));
    }
    const cdOk=r=>{const k=rKind(r);return k!=='data';};
    function fixRules(){
      if(!('rules' in S))return;
      if(!Array.isArray(S.rules))S.rules=[];
      if(S.rules.some(r=>!isObj(r)))S.rules=S.rules.filter(isObj);
      fixIds('r',S.rules);
      const C=new Set(CAUS().map(k=>k.id)),T=new Set(S.objects.filter(s=>!isCard(s)).map(s=>s.id).concat((S.groups||[]).map(g=>g.id),BGS().map(b=>b.id)));
      const TC=new Set([...T].concat(S.objects.filter(isCard).map(s=>s.id)));
      const SI=new Set(styles().filter(Boolean).map(x=>x.id));
      const only=(a,ok)=>Array.isArray(a)?a.filter((v,i)=>ok.has(v)&&a.indexOf(v)===i):[];
      const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
      S.rules.forEach(r=>{
        let c=only(r.c,C);
        const k0=c.length?causeOf(c[0]):null;
        if(k0)c=k0.k==='cond'?c.filter(id=>causeOf(id).k==='cond'):[c[0]];
        const on=only(r.on,!k0||k0.k!=='data'?TC:T);
        if(!same(c,r.c))r.c=c;
        if(!same(on,r.on))r.on=on;
        if(!Array.isArray(r.fx))r.fx=[];
        if(r.fx.some(x=>!isObj(x)||!FX_K[x.k]))r.fx=r.fx.filter(x=>isObj(x)&&FX_K[x.k]);
        const ok=k0?FX_OK[k0.k]:FX_K,seen={};
        if(r.fx.some(x=>!ok[x.k]||seen[x.k]||!(seen[x.k]=1)))r.fx=r.fx.filter((x,i)=>ok[x.k]&&r.fx.findIndex(q=>q.k===x.k)===i);
        r.fx.forEach(x=>fixFx(x,only,same,SI,TC));
        const ax=r.fx.find(x=>x.k==='act');let mv=r.fx.find(x=>x.k==='mv');
        if(ax&&actA(ax)==='sty'){
          const A=(ax.sty||[]).filter(id=>isAn(stById(id)));
          if(A.length){
            if(!mv){mv={k:'mv',mo:[],to:(ax.to||[]).slice()};r.fx.push(mv);}
            mv.mo=mvOne(mv.mo.concat(A.filter(id=>mv.mo.indexOf(id)<0)));
            ax.sty=ax.sty.filter(id=>A.indexOf(id)<0);
            if(!ax.sty.length)r.fx=r.fx.filter(x=>x!==ax);
          }
        }
        if(mv&&ax&&r.fx.indexOf(ax)>=0&&actA(ax)!=='sty')r.fx=r.fx.filter(x=>x!==(actA(ax)?mv:ax));
        if(mv&&ax&&r.fx.indexOf(ax)>=0&&r.fx.indexOf(mv)>=0){
          const U=(ax.to||[]).concat((mv.to||[]).filter(id=>(ax.to||[]).indexOf(id)<0));
          if(!same(U,ax.to))ax.to=U.slice();if(!same(U,mv.to))mv.to=U.slice();
        }
        if('j' in r&&r.j!=='or')delete r.j;
      });
      if(S.rules.some(r=>!!fxOf(r,'mv'))&&!(S.need>=6))S.need=6;
    }
    const FX_K={look:1,sym:1,follow:1,act:1,pho:1,mv:1};
    let mvCut=[];
    function mvOne(L){
      if(L.length<2)return L;
      L.slice(1).forEach(id=>{const q=stById(id),n=q&&q.n||'(unnamed)';if(mvCut.indexOf(n)<0)mvCut.push(n);});
      return L.slice(0,1);
    }
    function fixFx(x,only,same,SI,T){
      const str=q=>{if(q in x&&typeof x[q]!=='string')x[q]=x[q]==null?'':String(x[q]);};
      if(x.k==='look'){const a=only(x.sty,SI);if(!same(a,x.sty))x.sty=a;return;}
      if(x.k==='sym'){str('icon');if(!('icon' in x))x.icon='';return;}
      if(x.k==='mv'){
        const mo=mvOne(only(x.mo,SI).filter(id=>isAn(stById(id)))),to=only(x.to,T);
        if(!same(mo,x.mo))x.mo=mo;if(!same(to,x.to))x.to=to;
        if('md' in x&&x.md!=='g')delete x.md;
        if(x.md==='g'){if('pt' in x){const v=Math.round(+x.pt);if(!isFinite(v))delete x.pt;else if(clamp(v,0,100)!==x.pt)x.pt=clamp(v,0,100);}}
        else if('pt' in x)delete x.pt;
        ['a','e','sty','svc','d','u','pg','tt','tdir','tms'].forEach(q=>{if(q in x)delete x[q];});
        return;
      }
      if(x.k==='act'){
        if('a' in x&&ACT_A.indexOf(x.a)<0)delete x.a;
        const a=actA(x),drop=q=>{if(q in x)delete x[q];};
        if(a==='page'){
          ['e','sty','to','svc','d','u'].forEach(drop);str('pg');if(!('pg' in x))x.pg='';
          if('tt' in x&&PG_TT.indexOf(x.tt)<0)delete x.tt;
          if('tdir' in x){const D=PG_DIR[pgTr(x).t];if(!D||!D.some(q=>q[0]===x.tdir))delete x.tdir;}
          if('tms' in x){const v=Math.round(+x.tms);if(!('tt' in x)||!(v>0))delete x.tms;else if(v!==x.tms)x.tms=clamp(v,50,5000);}
          return;
        }
        ['pg','tt','tdir','tms'].forEach(drop);
        if(a==='nav'){['e','sty','to','svc','d'].forEach(drop);str('u');if(!('u' in x))x.u='';return;}
        drop('u');
        if(a==='sty'){
          const st=only(x.sty,SI),to=only(x.to,T);
          if(!same(st,x.sty))x.sty=st;if(!same(to,x.to))x.to=to;drop('e');
        }else{['sty','to'].forEach(drop);if(a){str('e');if(!('e' in x))x.e='';}else drop('e');}
        if(a==='svc'){str('svc');str('d');if(!('svc' in x))x.svc='';if(!('d' in x))x.d='';}else ['svc','d'].forEach(drop);
        return;
      }
      if(x.k==='pho'){str('n');if(!('n' in x))x.n='';return;}
      if(BIND.indexOf(x.p)>=0){
        ['map','ph','dec','pre','suf'].forEach(q=>{if(q in x)delete x[q];});
        const num=q=>{if(q in x&&(x[q]===''||x[q]==null||!isFinite(+x[q])))delete x[q];else if(q in x&&typeof x[q]!=='number')x[q]=+x[q];};
        ['i0','i1','tm'].concat(x.p==='fc'?['oa0','oa1']:['o0','o1']).forEach(num);
        if(x.p==='fc')['o0','o1'].forEach(q=>{if(q in x&&!/^#[0-9a-f]{6}$/i.test(String(x[q])))delete x[q];});
        else ['oa0','oa1'].forEach(q=>{if(q in x)delete x[q];});
        if(x.p==='mo'){['o0','o1','pv'].forEach(q=>{if(q in x)delete x[q];});if('mo' in x&&!isFinite(+x.mo))delete x.mo;else if('mo' in x&&typeof x.mo!=='number')x.mo=+x.mo;}
        else if('mo' in x)delete x.mo;
        if('pv' in x&&(!bindTf(x)||!PIV.some(q=>q[0]===x.pv)||x.pv==='c'))delete x.pv;
        if(x.p==='sp'){if('an' in x&&!isFinite(+x.an))delete x.an;else if('an' in x&&typeof x.an!=='number')x.an=+x.an;}
        else if('an' in x)delete x.an;
        return;
      }
      ['i0','i1','o0','o1','oa0','oa1','pv','tm','an','mo'].forEach(q=>{if(q in x)delete x[q];});
      if(x.p!=='text'&&x.p!=='opacity')x.p='opacity';
      if(x.p==='opacity'){
        if(!FMAPS[x.map])x.map='brightness';
        if('ph' in x&&(typeof x.ph!=='string'||!x.ph.trim()))delete x.ph;
        ['dec','pre','suf'].forEach(q=>{if(q in x)delete x[q];});
      }else{
        if('map' in x)delete x.map;
        if('ph' in x)delete x.ph;
        if('dec' in x){const d=Math.round(+x.dec);if(x.dec===''||x.dec==null||!(d>=0))delete x.dec;else if(d!==x.dec)x.dec=Math.min(6,d);}
        ['pre','suf'].forEach(q=>{if(q in x&&(typeof x[q]!=='string'||!x[q]))delete x[q];});
      }
    }
    const ruBolt=(t,f,n)=>n&&!f?'<span class="eb n">'+EV_BOLT+'</span>':'<span class="eb'+(f?' f':t?' t':'')+'" title="'+(f?'simulated value':t?'true now':'false now')+'">'+EV_BOLT+'</span>';
    let ruBy='c',ruOp=new Set(),ruOpP=null,ruSeen='';
    try{if(localStorage.getItem(KEY+'-ruby')==='o')ruBy='o';}catch(_){}
    function ruVis(r){
      if(!hasPgs())return true;
      const O=rObjs(r);
      return rBgs(r).length>0||!O.length||O.some(s=>!s.pg||s.pg===cpg());
    }
    function ruRows(){
      if(ruOpP!==proj){ruOpP=proj;ruOp=new Set();ruSeen='';}
      const R=RULS().filter(ruVis),C=CAUS(),P=RULS(),by=ruBy;
      const row=(r,k,d)=>{
        const p=rProblems(r),K=rCs(r).filter(x=>x!==k);
        return '<div class="er ri'+(r.id===ruCur?' on':'')+'" data-ru="'+r.id+'"'+(d?' style="padding-left:'+(24+LIND*d)+'px"':'')+'>'+ruBolt(rNow(r),rForced(r),rKind(r)==='data'||rKind(r)==='tap')+'<span class="nm">'+esc(rName(r))+'</span>'+ignTri(rIgn(r))+
          '<span class="sb">'+(P.indexOf(r)+1)+(p.length?' · ⚠ incomplete':K.length?' · '+(k?(K.length<rCs(r).length?(rOr(r)?'or ':'and '):'')+K.map(cName).join(', '):K.map(cName).join(rOr(r)?' or ':' and ')):'')+'</span></div>';
      };
      const nr=n=>n===1?'1 rule':n+' rules';
      const fold=(id,o)=>'<span class="fold" data-ruf="'+id+'" title="'+(o?'Collapse':'Expand')+'">'+(o?'▾':'▸')+'</span>';
      const head=(id,cl,d,nm,sb,U,rd)=>{const o=ruOp.has(id);
        return '<div class="er rh'+cl+'" data-ruf="'+id+'"'+(d?' style="padding-left:'+(6+LIND*d)+'px"':'')+'>'+fold(id,o)+nm+'<span class="sb">'+sb+'</span></div>'+(o?U.map(r=>row(r,null,rd)).join(''):'');};
      const cur=ruleOf(ruCur);
      if(cur&&cur!==drR&&ruCur!==ruSeen&&ruVis(cur)){
        if(by==='c'){const K=rCs(cur);if(!K.length)ruOp.add('nc');else if(!K.some(k=>ruOp.has(k.id)))ruOp.add(K[0].id);}
        else{
          const T=rOn(cur);
          if(!T.length)ruOp.add('nt');
          else if(!T.some(id=>ruOp.has(id))){const id=T[0],o=objOf(id);
            (o?chainOf(o):grpOf(id)?chainG(gpar(id)):[]).forEach(g=>ruOp.add(g));ruOp.add(id);}
        }
      }
      ruSeen=ruCur;
      let h='<div class="rusw" role="group" aria-label="Sort"><button type="button" data-ruby="c" aria-pressed="'+(by==='c')+'">By cause</button>'+
        '<button type="button" data-ruby="o" aria-pressed="'+(by==='o')+'">By object</button></div>';
      if(drR)h+='<div class="er ri dr'+(drR.id===ruCur?' on':'')+'" data-ru="'+drR.id+'"><span class="nm">'+esc(rName(drR))+'</span><span class="sb">new</span></div>';
      if(!P.length&&!C.length)return h+(drR?'':'<p class="hint" style="margin:2px 6px 6px">Nothing yet: add a cause or a rule with +</p>');
      if(by==='c'){
        const L=C.map((k,i)=>({k,i,a:cUsers(k),u:cUsers(k).filter(ruVis)})).filter(x=>x.u.length||!x.a.length).sort((x,y)=>y.u.length-x.u.length||x.i-y.i);
        h+=L.map(({k,u})=>{const o=ruOp.has(k.id);
          return '<div class="er rh'+(k.id===ruCur?' on':'')+'" data-ca="'+k.id+'">'+fold(k.id,o)+ruBolt(cNow(k),k.k!=='tap'&&!!simOf(k.e),k.k!=='cond')+
            '<span class="nm'+(isSp(k.e)?' ph':'')+'">'+esc(cName(k))+'</span><span class="sb">'+nr(u.length)+'</span></div>'+(o?u.map(r=>row(r,k)).join(''):'');}).join('');
        const N=R.filter(r=>!rCs(r).length);
        if(N.length)h+=head('nc',' nc',0,'<span class="nm">Without cause</span>',nr(N.length),N);
        return h;
      }
      const on=id=>R.filter(r=>rOn(r).indexOf(id)>=0);
      BGS().forEach(b=>{const U=on(b.id);if(U.length)h+=head(b.id,'',0,'<span class="nm">▣ '+esc(b.n||b.id)+'</span>',nr(U.length),U);});
      const need=new Set();
      const ruIn=id=>{const M=new Set(on(id));
        (S.groups||[]).forEach(G=>{if(G&&G.id!==id&&chainG(G.id).indexOf(id)>=0&&members(G.id).some(onPg))on(G.id).forEach(r=>M.add(r));});
        members(id).forEach(s=>{if(onPg(s))on(s.id).forEach(r=>M.add(r));});
        return M.size;};
      S.objects.forEach(s=>{if(onPg(s)&&on(s.id).length)chainOf(s).forEach(g=>need.add(g));});
      (S.groups||[]).forEach(G=>{if(G&&on(G.id).length&&members(G.id).some(onPg))chainG(G.id).forEach(g=>need.add(g));});
      let open=[],sec='';
      for(let i=S.objects.length-1;i>=0;i--){
        const s=S.objects[i],ch=chainOf(s).slice().reverse();
        if(!onPg(s))continue;
        const U=on(s.id);
        if(!U.length&&!ch.some(g=>need.has(g)))continue;
        if(hasPgs()){const k=comm(s)?'c':'p';if(k!==sec){sec=k;open=[];h+='<p class="pgsec">'+(k==='c'?'all pages':esc(pgName(pgOf(cpg()))))+'</p>';}}
        let k=0;while(k<open.length&&k<ch.length&&open[k]===ch[k])k++;
        open=ch.slice(0,k);
        for(let j=k;j<ch.length;j++){
          const id=ch[j];open.push(id);
          if(!need.has(id)||ch.slice(0,j).some(g=>!ruOp.has(g)))continue;
          const G=grpOf(id),V=on(id);
          h+=head(id,' grh',j,'<span class="nm">'+esc((G&&G.n)||'(unnamed)')+'</span>',nr(ruIn(id)),V,j);
        }
        if(!U.length||ch.some(g=>!ruOp.has(g)))continue;
        h+=head(s.id,'',ch.length,'<span class="nm">'+(isEl(s)?(s.t==='label'?'T ':'★ '):isCard(s)?'▭ ':s.t==='line'?'╱ ':'')+esc(s.n||'(unnamed)')+'</span>',nr(U.length),U,ch.length);
      }
      const N=R.filter(r=>!rOn(r).length||!rObjs(r).length&&!rBgs(r).length);
      if(N.length)h+=head('nt',' nc',0,'<span class="nm">Without target</span>',nr(N.length),N);
      return h;
    }
    const tapOnL=k=>SW_A[tapG(k)]?'swipe '+SW_A[tapG(k)]+' on':'tap on';
    function cText(k){
      if(k.k==='tap')return 'the '+cAuto(k).toLowerCase()+' on each object of «'+tapOnL(k)+'»';
      const f=simOf(k.e)?' · simulated':'';
      if(!k.e)return 'entity: choose one'+f;
      const st=simStates(true)[k.e];
      if(!st)return 'no entity with this id'+f;
      const raw=k.a?(st.attributes||{})[k.a]:st.state,n=(st.attributes&&st.attributes.friendly_name)||k.e;
      const v=raw===undefined||raw===null?'—':typeof raw==='object'?JSON.stringify(raw):String(raw);
      return n+' · now '+v+(k.k==='data'?'':' · '+(cLive(k)?'true':'false'))+f;
    }
    const simBri=k=>k.k==='data'&&k.a==='brightness'&&entDom(k.e)==='light';
    function simVal(e,w){
      const x=simOf(e);if(!x)return '';
      const v=w==='s'?x.s:isObj(x.a)?x.a[w.slice(2)]:undefined;
      return v==null?'':String(v);
    }
    function cEnt(k){
      if(!k.e)return 'entity: choose one';
      const st=simStates(true)[k.e];
      return st?(st.attributes&&st.attributes.friendly_name)||k.e:'no entity with this id';
    }
    function cVal(k){
      const st=k.e&&simStates(true)[k.e],raw=st?(k.a?(st.attributes||{})[k.a]:st.state):undefined;
      return raw===undefined||raw===null?'':typeof raw==='object'?JSON.stringify(raw):String(raw);
    }
    const TE_ST={sun:['above_horizon','below_horizon'],cover:['open','closed','opening','closing'],lock:['locked','unlocked'],
      person:['home','not_home'],device_tracker:['home','not_home']};
    const TE_ONOFF=/^(light|switch|input_boolean|binary_sensor|fan|automation|script|group|siren|remote|media_player)$/;
    function teEnts(){
      const M=new Map();
      CAUS().forEach(k=>{
        if(k.k==='tap'||!k.e)return;
        if(!M.has(k.e))M.set(k.e,{f:[],c:[]});
        const x=M.get(k.e),add=w=>{if(x.f.indexOf(w)<0)x.f.push(w);};
        add(k.a?'a:'+k.a:'s');if(simBri(k))add('s');
        x.c.push(k);
      });
      return M;
    }
    function teReal(e,w){
      const h=self._hass,st=h&&h.states&&h.states[e];if(!st)return '';
      const v=w==='s'?st.state:(st.attributes||{})[w.slice(2)];
      return v==null?'':typeof v==='object'?JSON.stringify(v):String(v);
    }
    function teOpts(e,x,w){
      const d=entDom(e),L=[];
      const add=v=>{v=v==null?'':String(v);if(v!==''&&L.indexOf(v)<0)L.push(v);};
      if(w==='s'){(TE_ST[d]||(TE_ONOFF.test(d)?['on','off']:[])).forEach(add);}
      x.c.forEach(k=>{if(k.k==='cond'&&(k.a?'a:'+k.a:'s')===w){add(k.v);if(k.op==='btw')add(k.v2);}});
      add(teReal(e,w));
      return L;
    }
    function teRows(){
      const M=teEnts();
      if(!M.size)return '<p class="hint" style="margin:6px">No causes with an entity</p>';
      if(teCur&&!M.has(teCur))teCur='';
      const S2=simStates(true);let h='';
      M.forEach((x,e)=>{
        const st=S2[e],nm=(st&&st.attributes&&st.attributes.friendly_name)||e,sim=!!simOf(e);
        const v=x.f.map(w=>{const sv=simVal(e,w);return sv!==''?sv:teReal(e,w);}).filter(Boolean).join(' · ');
        h+='<div class="te'+(e===teCur?' on':'')+'" data-te="'+esc(e)+'" title="'+esc(e)+'"><span class="nm'+(st?'':' no')+'">'+esc(nm)+'</span>'+
          '<span class="tv'+(sim?' sim':'')+'">'+esc(v)+'</span><span class="tu">'+x.c.length+' <small>in use</small></span></div>';
      });
      return h;
    }
    function teTargets(K){
      const out=[],seen=new Map();
      RULS().forEach(r=>{
        if(!rCs(r).some(k=>K.indexOf(k)>=0))return;
        const on=rKind(r)==='cond'&&rNow(r);
        rOn(r).forEach(id=>{const o=tgtOf(id);if(!o)return;if(seen.has(o)){if(on)seen.get(o).on=true;return;}const q={o:o,on:on};seen.set(o,q);out.push(q);});
      });
      return out;
    }
    function tePanel(){
      const n=E.tepanel,x=teEnts().get(teCur);
      if(!x){if(n._k!==''){n._k='';n.innerHTML='';}return;}
      const st=simStates(true)[teCur],nm=(st&&st.attributes&&st.attributes.friendly_name)||teCur,T=teTargets(x.c);
      const key=JSON.stringify([teCur,nm,x.f,x.f.map(w=>teOpts(teCur,x,w)),x.c.map(k=>[k.id,cName(k)]),T.map(q=>tgtName(q.o))]);
      if(n._k!==key){
        n._k=key;
        let h='<h2 class="ttl">'+esc(nm)+'</h2><p class="hint teid">'+esc(teCur)+'</p>';
        x.f.forEach((w,i)=>{
          const l=w==='s'?'state':w.slice(2);
          h+='<div class="tef"><span>'+esc(l)+'</span>'+
            '<input class="num" data-tsim="'+esc(teCur+'|'+w)+'" type="text" list="tdl'+i+'" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="'+esc(l)+'">'+
            '<datalist id="tdl'+i+'">'+teOpts(teCur,x,w).map(v=>'<option value="'+esc(v)+'">').join('')+'</datalist>'+
            '<button type="button" class="evb" data-tclr="'+esc(teCur+'|'+w)+'" title="Real value" aria-label="Real value" hidden>✕</button></div>';
        });
        h+='<h3>Causes</h3><div class="evu">'+x.c.map(k=>'<button type="button" data-tca="'+k.id+'"><svg viewBox="0 0 24 24"><path d="M7,2V13H10V22L17,10H13L17,2H7Z"/></svg>'+esc(cName(k))+'</button>').join('')+'</div>'+
          '<h3>Objects</h3>'+(T.length?'<div class="evu">'+T.map((q,i)=>'<button type="button" data-tob="'+i+'">'+esc(tgtName(q.o))+'</button>').join('')+'</div>':'<p class="hint">none</p>');
        n.innerHTML=h;
      }
      teLive();
    }
    function teLive(){
      const x=teEnts().get(teCur);if(!x)return;
      E.tepanel.querySelectorAll('[data-tsim]').forEach(i=>{
        const [e,w]=i.dataset.tsim.split('|'),sv=simVal(e,w),on=sv!=='';
        if(i!==root.activeElement){const v=on?sv:teReal(e,w);if(i.value!==v)i.value=v;}
        if(i.classList.contains('sim')!==on)i.classList.toggle('sim');
        const b=i.parentNode.querySelector('[data-tclr]');if(b&&b.hidden===on)b.hidden=!on;
      });
      E.tepanel.querySelectorAll('[data-tca]').forEach(b=>{const k=causeOf(b.dataset.tca),on=!!k&&k.k==='cond'&&cNow(k);if(b.classList.contains('on')!==on)b.classList.toggle('on');});
      const T=teTargets(x.c);
      E.tepanel.querySelectorAll('[data-tob]').forEach(b=>{const q=T[+b.dataset.tob],on=!!q&&q.on;if(b.classList.contains('on')!==on)b.classList.toggle('on');});
    }
    function simPut(e,w,v){
      if(clkPl&&!clkWr&&clkKeep)clkKeep[e+'|'+w]=1;
      if(!isObj(S.sim))S.sim={};
      const x=isObj(S.sim[e])?S.sim[e]:(S.sim[e]={});
      const off=v===''||v===teReal(e,w);
      if(w==='s'){if(off)delete x.s;else x.s=v;}
      else{
        const a=w.slice(2);if(!isObj(x.a))x.a={};
        if(off)delete x.a[a];else x.a[a]=v.trim()!==''&&isFinite(+v)?+v:v;
        if(!Object.keys(x.a).length)delete x.a;
      }
      if(!('s' in x)&&!('a' in x))delete S.sim[e];
      if(!Object.keys(S.sim).length)delete S.sim;
    }

    const RAD=Math.PI/180;
    const clkCf=()=>{const h=self._hraw||self._hass;return (h&&h.config)||{};};
    const clkTz=()=>{const z=clkCf().time_zone;return typeof z==='string'&&z?z:undefined;};
    const clkF={};
    function clkP(ms,tz){
      const k=tz||'';
      if(!clkF[k]){
        const o={hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',weekday:'short'};
        try{clkF[k]=new Intl.DateTimeFormat('en-US',tz?Object.assign({timeZone:tz},o):o);}catch(_){clkF[k]=new Intl.DateTimeFormat('en-US',o);}
      }
      const P={};clkF[k].formatToParts(new Date(ms)).forEach(x=>{P[x.type]=x.value;});
      return {y:+P.year,mo:+P.month,d:+P.day,h:+P.hour%24,mi:+P.minute,s:+P.second,wd:P.weekday};
    }
    const clkOff0=(ms,tz)=>{const P=clkP(ms,tz);return Date.UTC(P.y,P.mo-1,P.d,P.h,P.mi,P.s)-Math.floor(ms/1000)*1000;};
    function clkMs(y,mo,d,h,mi,tz){
      const g=Date.UTC(y,mo-1,d,h,mi);let t=g-clkOff0(g,tz);t=g-clkOff0(t,tz);return t;
    }
    const p2=n=>String(n).padStart(2,'0');
    const clkIso=(ms,us)=>{const s=new Date(ms).toISOString();return s.slice(0,19)+(us?s.slice(19,23)+'000':'')+'+00:00';};
    function clkLoc(ms,tz){
      const P=clkP(ms,tz),o=Math.round(clkOff0(ms,tz)/6e4),a=Math.abs(o);
      return P.y+'-'+p2(P.mo)+'-'+p2(P.d)+'T'+p2(P.h)+':'+p2(P.mi)+':'+p2(P.s)+(o<0?'-':'+')+p2(Math.floor(a/60))+':'+p2(a%60);
    }
    function sunAt(ms,lat,lon){
      const T=(ms/864e5+2440587.5-2451545)/36525;
      const L0=((280.46646+T*(36000.76983+T*0.0003032))%360+360)%360,M=357.52911+T*(35999.05029-0.0001537*T);
      const e=0.016708634-T*(0.000042037+0.0000001267*T);
      const C=Math.sin(M*RAD)*(1.914602-T*(0.004817+0.000014*T))+Math.sin(2*M*RAD)*(0.019993-0.000101*T)+Math.sin(3*M*RAD)*0.000289;
      const om=125.04-1934.136*T,lam=L0+C-0.00569-0.00478*Math.sin(om*RAD);
      const ob=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60+0.00256*Math.cos(om*RAD);
      const dec=Math.asin(Math.sin(ob*RAD)*Math.sin(lam*RAD)),y=Math.pow(Math.tan(ob*RAD/2),2);
      const eq=4/RAD*(y*Math.sin(2*L0*RAD)-2*e*Math.sin(M*RAD)+4*e*y*Math.sin(M*RAD)*Math.cos(2*L0*RAD)-0.5*y*y*Math.sin(4*L0*RAD)-1.25*e*e*Math.sin(2*M*RAD));
      const um=((ms/6e4)%1440+1440)%1440;
      let ha=(um+eq+4*lon)/4-180;ha=((ha+180)%360+360)%360-180;
      const la=lat*RAD,cz=clamp(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha*RAD),-1,1),z=Math.acos(cz),g=90-z/RAD;
      const te=Math.tan(g*RAD);
      const rf=g>85?0:g>5?58.1/te-0.07/Math.pow(te,3)+0.000086/Math.pow(te,5):g>-0.575?1735+g*(-518.2+g*(103.4+g*(-12.79+g*0.711))):-20.772/te;
      let az=0;const ad=Math.cos(la)*Math.sin(z);
      if(Math.abs(ad)>0.001){az=180-Math.acos(clamp((Math.sin(la)*cz-Math.sin(dec))/ad,-1,1))/RAD;if(ha>0)az=-az;}
      else az=lat>0?180:0;
      return {g:g,el:g+rf/3600,az:(az+360)%360,ha:ha};
    }
    function sunCross(t,f){
      let a=t,fa=f(a);
      for(let i=0;i<288;i++){
        const b=a+6e5,fb=f(b);
        if(!fa&&fb){let lo=a,hi=b;for(let j=0;j<20;j++){const m=(lo+hi)/2;if(f(m))hi=m;else lo=m;}return Math.round(hi);}
        a=b;fa=fb;
      }
      return null;
    }
    function clkSun(t){
      const c=clkCf(),lat=+c.latitude,lon=+c.longitude,hm=+c.elevation;
      if(!isFinite(lat)||!isFinite(lon))return null;
      const ad=hm>0?Math.acos(6356900/(6356900+hm))/RAD:0,at=m=>sunAt(m,lat,lon);
      const up=th=>m=>at(m).g>=th,dn=th=>m=>at(m).g<th;
      const N={dawn:sunCross(t,up(-6-ad)),dusk:sunCross(t,dn(-6-ad)),rising:sunCross(t,up(-0.833-ad)),setting:sunCross(t,dn(-0.833-ad)),
        noon:sunCross(t,m=>{const h=at(m).ha;return h>=0&&h<90;}),midnight:sunCross(t,m=>at(m).ha<-90)};
      const p=at(t);
      return {el:Math.round(p.el*100)/100,az:Math.round(p.az*100)/100,N:N,
        up:N.rising!=null&&N.setting!=null?N.rising>N.setting:p.el>-0.833,rise:N.noon!=null&&N.midnight!=null?N.noon<N.midnight:p.ha<0};
    }
    function clkKind(m,t,X){
      const tz=X.tz,P=X.P||(X.P=clkP(t,tz)),U=new Date(t),hm=p2(P.h)+':'+p2(P.mi),dt=P.y+'-'+p2(P.mo)+'-'+p2(P.d);
      const uh=p2(U.getUTCHours())+':'+p2(U.getUTCMinutes()),ud=U.toISOString().slice(0,10);
      const TD={time:hm,date:dt,date_time:dt+', '+hm,date_time_utc:ud+', '+uh,date_time_iso:dt+'T'+hm+':00',time_date:hm+', '+dt,time_utc:uh};
      if(m.indexOf('sensor.')===0&&m.slice(7) in TD)return {s:TD[m.slice(7)]};
      const Z=X.sun===undefined?(X.sun=clkSun(t)):X.sun;if(!Z)return null;
      if(m==='sun.sun'){
        const a={elevation:Z.el,azimuth:Z.az,rising:Z.rise};
        Object.keys(Z.N).forEach(k=>{if(Z.N[k]!=null)a['next_'+k]=clkIso(Z.N[k],true);});
        return {s:Z.up?'above_horizon':'below_horizon',a:a};
      }
      if(m==='binary_sensor.sun_solar_rising')return {s:Z.rise?'on':'off'};
      const k=m.slice(11);
      if(k==='solar_elevation')return {s:Z.el};
      if(k==='solar_azimuth')return {s:Z.az};
      const n=Z.N[k.slice(5)];return n==null?null:{s:clkIso(n,false)};
    }
    function clkOf(e,R){
      if(e.indexOf('sun.')===0)return 'sun.sun';
      const r=R[e],pl=r&&r.platform,tk=r&&r.translation_key,d=e.split('.')[0];
      if(pl==='sun'&&tk==='solar_rising'&&d==='binary_sensor')return 'binary_sensor.sun_solar_rising';
      if(pl==='sun'&&CLK_SUN.indexOf(tk)>=0&&d==='sensor')return 'sensor.sun_'+tk;
      if(pl==='time_date'&&CLK_TD.indexOf(tk)>=0)return 'sensor.'+tk;
      return !pl&&CK_M.indexOf(e)>=0?e:'';
    }
    const clkMin=(v,tz)=>{const ms=Date.parse(v);if(!isFinite(ms))return null;const P=clkP(ms,tz);return P.h*60+P.mi+P.s/60;};
    function clkVals(t){
      const h=self._hraw||self._hass,st=(h&&h.states)||{},R=(h&&h.entities)||{},tz=clkTz(),X={tz:tz},V={};
      const P=X.P=clkP(t,tz),nm=P.h*60+P.mi+P.s/60;
      Object.keys(st).forEach(e=>{
        const m=clkOf(e,R);
        if(m){const v=clkKind(m,t,X);if(v)V[e]=v;return;}
        const r=R[e],a=st[e].attributes||{};
        if(r&&r.platform==='tod'&&a.after&&a.before){
          const lo=clkMin(a.after,tz),hi=clkMin(a.before,tz);if(lo==null||hi==null)return;
          V[e]={s:(lo<=hi?nm>=lo&&nm<hi:nm>=lo||nm<hi)?'on':'off'};
        }
      });
      SPS().forEach(x=>{if(x.m){const v=clkKind(x.m,t,X);if(v)V[x.e]=v;}});
      return V;
    }
    function clkW(e,v){
      const K=clkKeep,o={};clkWr=true;
      if('s' in v&&!(K&&K[e+'|s'])){simPut(e,'s',String(v.s));o.s=v.s;}
      Object.keys(v.a||{}).forEach(k=>{if(K&&K[e+'|a:'+k])return;simPut(e,'a:'+k,String(v.a[k]));(o.a||(o.a={}))[k]=v.a[k];});
      clkWr=false;return o;
    }
    function clkOff(){
      const c=S.clk;delete S.clk;if(!isObj(c)||!isObj(c.w))return;
      clkWr=true;
      Object.keys(c.w).forEach(e=>{
        const v=c.w[e];if(!isObj(v))return;
        const cur=w=>{const x=simOf(e);return !x?undefined:w==='s'?x.s:isObj(x.a)?x.a[w.slice(2)]:undefined;};
        if('s' in v&&cur('s')!==undefined&&String(cur('s'))===String(v.s))simPut(e,'s','');
        Object.keys(v.a||{}).forEach(k=>{const x=cur('a:'+k);if(x!==undefined&&String(x)===String(v.a[k]))simPut(e,'a:'+k,'');});
      });
      clkWr=false;
    }
    function clkSet(t,tick){
      clkOff();
      if(!tick)clkCal={};
      const V=clkVals(t),W={};
      Object.keys(V).forEach(e=>{W[e]=clkW(e,V[e]);});
      S.clk={t:t,w:W};
      clkLater(t);
    }
    let clkPl=0,clkKeep=null,clkWr=false,clkCal={};
    const CLK_STEP=3e5,CLK_MS=500;
    function clkPlay(){
      if(clkPl)return;
      settle();clkKeep={};
      if(!isObj(S.clk))clkSet(Math.floor(Date.now()/CLK_STEP)*CLK_STEP);
      clkPl=setInterval(clkTick,CLK_MS);
    }
    function clkTick(){
      if(!flow||!flCv||!isObj(S.clk)||!self.isConnected){clkStop();render();return;}
      clkSet(S.clk.t+CLK_STEP,true);render();
    }
    function clkStop(){if(!clkPl)return;clearInterval(clkPl);clkPl=0;clkKeep=null;store(true);}
    let clkT=0,clkSch=null;
    function clkLater(t){clearTimeout(clkT);clkT=setTimeout(()=>clkAsync(t),300);}
    async function clkAsync(t){
      const h=self._hass,st=(h&&h.states)||{},tz=clkTz(),V={};
      const SC=Object.keys(st).filter(e=>e.indexOf('schedule.')===0),CA=Object.keys(st).filter(e=>e.indexOf('calendar.')===0);
      if(!h||!h.callWS||!SC.length&&!CA.length)return;
      if(SC.length){
        try{
          if(!clkSch){
            const [L,R]=await Promise.all([h.callWS({type:'schedule/list'}),h.callWS({type:'config/entity_registry/list'})]);
            const I={};(Array.isArray(L)?L:[]).forEach(x=>{if(x&&x.id)I[x.id]=x;});
            clkSch={};(Array.isArray(R)?R:[]).forEach(r=>{if(r&&r.platform==='schedule'&&I[r.unique_id])clkSch[r.entity_id]=I[r.unique_id];});
          }
          const DW=['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
          const P=clkP(t,tz),wd=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(P.wd),sec=P.h*3600+P.mi*60+P.s;
          const hs=x=>{const q=String(x||'').split(':');return (+q[0]||0)*3600+(+q[1]||0)*60+(+q[2]||0);};
          SC.forEach(e=>{
            const x=clkSch[e];if(!x||wd<0)return;
            const B=d=>(Array.isArray(x[DW[(wd+d)%7]])?x[DW[(wd+d)%7]]:[]).map(b=>({f:hs(b.from),to:hs(b.to)}));
            const on=B(0).some(b=>sec>=b.f&&sec<b.to);
            let nx=null;
            for(let d=0;d<8&&nx==null;d++){
              const Q=[];B(d).forEach(b=>{Q.push(on?b.to:b.f);});
              Q.filter(s=>d>0||s>sec).sort((a,b)=>a-b).slice(0,1).forEach(s=>{
                const D=new Date(Date.UTC(P.y,P.mo-1,P.d+d));nx=clkMs(D.getUTCFullYear(),D.getUTCMonth()+1,D.getUTCDate(),0,0,tz)+s*1000;});
            }
            V[e]={s:on?'on':'off',a:nx!=null?{next_event:clkLoc(nx,tz)}:{}};
          });
        }catch(_){clkSch=clkSch||{};}
      }
      if(CA.length&&h.callApi){
        const a=new Date(t-864e5).toISOString(),b=new Date(t+30*864e5).toISOString();
        await Promise.all(CA.map(async e=>{
          try{
            const K=clkCal[e];let L;
            if(K&&t>=K.t&&t<K.t+20*864e5)L=K.L;
            else{L=await h.callApi('GET','calendars/'+e+'?start='+encodeURIComponent(a)+'&end='+encodeURIComponent(b));clkCal[e]={t:t,L:L};}
            const tm=x=>!x?NaN:x.dateTime?Date.parse(x.dateTime):x.date?clkMs(+x.date.slice(0,4),+x.date.slice(5,7),+x.date.slice(8,10),0,0,tz):NaN;
            const Q=(Array.isArray(L)?L:[]).map(v=>({v:v,s:tm(v.start),e:tm(v.end),ad:!!(v.start&&v.start.date&&!v.start.dateTime)})).filter(x=>isFinite(x.s)&&isFinite(x.e)&&x.e>t).sort((p,q)=>p.s-q.s);
            const cu=Q.find(x=>x.s<=t)||Q[0],loc=ms=>clkLoc(ms,tz).slice(0,19).replace('T',' ');
            V[e]=cu?{s:cu.s<=t?'on':'off',a:{message:cu.v.summary||'',all_day:cu.ad,start_time:loc(cu.s),end_time:loc(cu.e),location:cu.v.location||'',description:cu.v.description||''}}:{s:'off'};
          }catch(_){}
        }));
      }
      if(!isObj(S.clk)||S.clk.t!==t||!Object.keys(V).length)return;
      Object.keys(V).forEach(e=>{S.clk.w[e]=clkW(e,V[e]);});
      render();if(!clkPl)store();
    }
    function cKindSel(k){
      if(k.k==='tap'||cUsers(k).length)return '';
      return '<label class="f">kind<select class="num" data-cf="k" style="width:auto" aria-label="Kind">'+
        '<option value="cond"'+(k.k==='cond'?' selected':'')+'>condition</option><option value="data"'+(k.k==='data'?' selected':'')+'>data</option></select></label>';
    }
    const ruX=new Set();
    let rcT=null;
    const cDone=k=>k.k==='tap'||(k.k==='data'?ENT_OK.test(k.e||''):!!causeJS(k));
    const cOut=k=>k.k==='data'?(cVal(k)||'—'):cDone(k)?String(cNow(k)):'—';
    const cWrap=(k,h)=>k.k==='tap'?h:'<div class="rcw">'+h+'<div class="rco" data-co="'+k.id+'"><span>output</span><b>'+esc(cOut(k))+'</b></div></div>';
    const rOutV=r=>{const K=rCs(r);return rKind(r)==='data'?cVal(K[0])||'—':K.some(k=>causeJS(k))?String(rNow(r)):'—';};
    const rOutC=r=>{const v=rOutV(r);return 'rco'+(v==='true'?' on':'')+(rForced(r)?' frc':'')+(v==='—'?' miss':'');};
    const rOut=r=>rKind(r)==='tap'?'':'<div class="rof"><div class="'+rOutC(r)+'" data-ro="'+r.id+'"><span>output</span><b>'+esc(rOutV(r))+'</b></div></div>';
    function cBlock(k,ctx){
      const btw=k.op==='btw',U=cUsers(k).length,nw=ctx==='n',wr=h=>ctx==='c'?cWrap(k,h):h;
      if(ctx==='r'&&!cDone(k))ruX.add(k.id);
      const also=U>1?'<small>also in '+(U-1)+(U===2?' other rule':' other rules')+'</small>':'';
      const ttl=(a,sub)=>'<button type="button" class="rcn" data-rcx="'+k.id+'"'+(k.k==='tap'?'':' title="Double-click to rename"')+'>'+a+'<span data-live="cn">'+esc(cName(k))+'</span>'+sub+'</button>';
      const del=nw?'<button type="button" class="evb" data-dcok title="Create" aria-label="Create"'+(cNewOk(k)?'':' disabled')+'>✓</button>'+
          '<button type="button" class="evb" data-dcx title="Cancel" aria-label="Cancel">✕</button>'
        :'<button type="button" class="evb" data-rcdel="'+k.id+'" title="Remove from rule" aria-label="Remove from rule">✕</button>';
      if(ctx==='r'&&!ruX.has(k.id))
        return ('<div class="rck rcc'+(k.k==='cond'&&cNow(k)?' on':'')+(k.k!=='tap'&&simOf(k.e)?' frc':'')+'" data-cid="'+k.id+'"><div class="rch">'+
          ttl('▸ ','<small>'+esc(k.n&&String(k.n).trim()?cAuto(k):'')+(U>1?(k.n?' · ':'')+'also in '+(U-1)+(U===2?' other rule':' other rules'):'')+'</small>')+del+'</div></div>');
      const head=ctx!=='c'?'<div class="rch">'+ttl(nw?'':'▾ ',also)+del+'</div>'
        :'<label class="f col">name<input class="num" data-cf="n" type="text" autocomplete="off" placeholder="'+esc(cAuto(k))+'" value="'+esc(k.n||'')+'"></label>'+cKindSel(k);
      if(k.k==='tap')return '<div class="rck" data-cid="'+k.id+'">'+head+'<div class="evn"><span data-live="ct">'+esc(cText(k))+'</span></div></div>';
      const ms=(nw||kDr(k))&&!cNewOk(k)||ctx==='r'&&!cDone(k)?' miss':'';
      const ent='<div class="evn"><span data-live="ct">'+esc(cEnt(k))+'</span></div>'+
        '<div class="evq"><input class="num" data-cf="e" type="text"'+pickAttrs('ents','entity')+' aria-label="Entity" value="'+esc(k.e||'')+'">'+
        '<select class="num" data-cf="a" aria-label="Attribute">'+evAttrOpts(k)+'</select></div>';
      if(k.k==='data')return wr('<div class="rck'+ms+(simOf(k.e)?' frc':'')+'" data-cid="'+k.id+'">'+head+ent+'</div>');
      return wr('<div class="rck'+ms+(cNow(k)?' on':'')+(simOf(k.e)?' frc':'')+'" data-cid="'+k.id+'">'+head+ent+
        '<div class="evq"><select class="num" data-cf="op" aria-label="Condition">'+EV_OPS.map(o=>'<option value="'+o[0]+'"'+(o[0]===k.op?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+
          '<input class="num" data-cf="v" type="text" autocomplete="off" aria-label="Threshold" placeholder="'+esc(cVal(k))+'" value="'+esc(k.v==null?'':String(k.v))+'">'+
          (btw?'<span>and</span><input class="num" data-cf="v2" type="text" autocomplete="off" aria-label="Second threshold" value="'+esc(k.v2==null?'':String(k.v2))+'">':'')+'</div>'+
        '<div class="cvo" data-live="cvo"'+(cValOffer(k)?'':' hidden')+'><p class="hint">To show this value on the label, use it as data instead of a condition.</p>'+
          '<div class="row"><button class="btn" type="button" data-cval="'+k.id+'">Show the value</button></div></div></div>');
    }
    function cTitle(id){
      const k=causeOf(id),b=E.rupanel.querySelector('[data-rcx="'+id+'"]');
      if(!k||!b||k.k==='tap')return;
      const i=document.createElement('input'),n0=k.n;
      i.className='num rcti';i.type='text';i.dataset.cf='n';i.autocomplete='off';i.spellcheck=false;
      i.setAttribute('aria-label','Cause name');i.placeholder=cAuto(k);i.value=k.n||'';
      b.replaceWith(i);i.focus();i.select();
      i.addEventListener('keydown',e=>{
        if(e.key==='Enter'){e.preventDefault();i.blur();}
        else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(k.n!==n0){if(n0==null)delete k.n;else k.n=n0;render();store();}i.blur();}
      });
      i.addEventListener('blur',()=>{E.rupanel._k='';ruPanel();},{once:true});
    }
    const tgtName=o=>isBgl(o)?'▣ '+(o.n||o.id):isGrp(o)?'▾ '+(o.n||'(unnamed)'):(isEl(o)?(o.t==='label'?'T ':'★ '):'')+(o.n||'(unnamed)');
    function tgtSub(o){
      if(isBgl(o))return 'background layer · '+o.id;
      if(isGrp(o)){const n=members(o.id).length;return 'group · '+n+(n===1?' object':' objects')+' · '+o.id;}
      return (o.t==='label'?'label':o.t==='icon'?'icon':'zone')+' · '+o.id;
    }
    const MISS_W=['no condition with an entity','no entity'],MISS_T=['no style','no effect','no entity for the action','no action','no service','no page'],MISS_O=['no target'],MISS_A=['no object to style'];
    const MISS_N=['no motion','no motion with poses'],MISS_M=['no object to move'];
    function rMiss(r){
      const p=rProblems(r),K=rCs(r),no=q=>[MISS_W,MISS_T,MISS_O,MISS_A,MISS_M,MISS_N].every(L=>L.indexOf(q)<0);
      return {w:!K.length||p.some(q=>MISS_W.indexOf(q)>=0),t:p.some(q=>MISS_T.indexOf(q)>=0),o:p.some(q=>MISS_O.indexOf(q)>=0),
        a:p.some(q=>MISS_A.indexOf(q)>=0),x:p.indexOf('no action')>=0,n:p.some(q=>MISS_N.indexOf(q)>=0),m:p.some(q=>MISS_M.indexOf(q)>=0),other:p.filter(no)};
    }
    function rState(r){
      const L=RULS(),m=rMiss(r),k=rKind(r),n=(m.w?1:0)+(m.t?1:0)+(m.o?1:0)+(m.a?1:0)+(m.n?1:0)+(m.m?1:0);
      const st=n?n+(n===1?' step left':' steps left'):m.other.length?'':k==='tap'?'on '+(SW_A[rGest(r)]?'swipe '+SW_A[rGest(r)]:'tap'):k==='data'?'follows the value':rNow(r)?'● active now':'not active now';
      return (r===drR?'new rule':'priority '+(L.indexOf(r)+1)+' of '+L.length)+(st?' · '+st:'')+(m.other.length?' · ⚠ '+m.other.join(', '):'')+
        rIgn(r).map(t=>' · ⚠ '+t).join('');
    }
    function folText(r){
      const k=rCs(r)[0],x=rFol(r);if(!k||!x||!k.e)return '';
      if(x.p==='mo'&&!moDrv(x)||x.p==='sp'&&!isAn(stById(+x.an)))return '';
      const st=simStates(true)[k.e];if(!st)return 'no value now';
      const v=fxRun(followJS(k,x),st);
      if(x.p==='text')return 'now: '+(v==null?'—':String(v));
      if(isBind(x)){
        const raw=k.a?(st.attributes||{})[k.a]:st.state,n=parseFloat(raw),u=(st.attributes||{}).unit_of_measurement;
        if(isNaN(n))return 'now: '+(raw==null?'—':String(raw))+' (not a number)';
        const o=bindAt(x,n),U=BIND_U[x.p];
        const out=x.p==='mo'?Math.round(o*100)+'% of the motion':x.p==='fc'?Math.round(o*100)+'% of the way':(x.p==='sp'&&o<=0||x.p==='fv'&&o===0)?'stopped':f(Math.round(o*100)/100)+(U==='°'||U==='%'?U:U?' '+U:'');
        return 'now: '+f(n)+(u&&!k.a?' '+u:'')+' → '+out;
      }
      const m=/--zv:\s*([-0-9.e]+)/.exec(String(v));
      return 'photo opacity now: '+(m?f(clamp(+m[1],0,1)):'—');
    }
    function actText(r){
      const x=fxOf(r,'act'),a=actA(x),e=x&&x.e||'',h=self._hass,has=id=>!!(h&&h.states&&h.states[id]);
      if(a==='toggle'){
        if(!ENT_OK.test(e))return 'choose the entity to switch';
        return 'calls '+actSvc(e)+(has(e)?'':' · no entity with this id');
      }
      if(a==='info'){
        if(!ENT_OK.test(e))return 'choose the entity';
        return 'opens the more-info of '+e+(has(e)?'':' · no entity with this id');
      }
      if(a==='page'){const P=pgOf(x.pg);return P?'opens “'+pgName(P)+'” · '+pgTrOf(x).lab+(PG_TT.indexOf(x.tt)<0?' · as page':''):'choose the page';}
      if(a==='nav')return NAV_OK.test(x.u||'')?'opens '+x.u:'write the address';
      if(a!=='svc')return '';
      if(!SVC_OK.test(x.svc||''))return 'choose the service';
      const d=svcData(x.d);if(d.bad)return 'data line '+d.bad+' not understood';
      const q=x.svc.split('.'),S2=h&&h.services,known=!!(S2&&S2[q[0]]&&S2[q[0]][q[1]]);
      return 'calls '+x.svc+(e?' · '+e:'')+(S2&&!known?' · no service with this name':'')+(e&&ENT_OK.test(e)&&!has(e)?' · no entity with this id':'');
    }
    function phNames(L){const a=[];L.filter(phMulti).forEach(s=>phAll(s).forEach(I=>{if(I.p){const n=phName(s,I);if(a.indexOf(n)<0)a.push(n);}}));return a;}
    function phSel(r,rx,cur,none){
      let N=phNames(rObjs(r));if(!N.length)N=phNames(S.objects);
      if(cur&&N.indexOf(cur)<0)N=N.concat([cur]);
      return '<select class="num" data-rx="'+rx+'" aria-label="Photo"><option value="">'+none+'</option>'+
        N.map(n=>'<option value="'+esc(n)+'"'+(n===cur?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select>';
    }
    function mvHTML(r,v,mm){
      const A=stSorted(styles().filter(isAn)),q=idsStys(v.mo).find(isAn),go=moGo(v);
      return '<label class="f">motion<select class="num'+(mm.n?' miss':'')+'" data-rx="mm" data-miss="n" style="width:auto;min-width:0;flex:1" aria-label="Motion">'+
          (q?'':'<option value="" selected>—</option>')+A.map(o=>'<option value="'+o.id+'"'+(o===q?' selected':'')+'>'+esc(o.n||'(unnamed)')+'</option>').join('')+
          '<option value="+a">new motion</option></select>'+(go&&q&&q.anim!=='custom'?'<span class="sow" title="go to needs a motion with poses">⚠</span>':'')+
          (q?'<button class="btn" type="button" data-sted="'+q.id+'">Edit</button>':'')+'</label>'+
        '<div class="row"><select class="num" data-rx="md" aria-label="Mode" style="width:auto"><option value="p"'+(go?'':' selected')+'>play</option><option value="g"'+(go?' selected':'')+'>go to</option></select>'+
        (go?'<span><input class="num" data-rx="pt" type="number" min="0" max="100" step="1" style="width:56px" aria-label="Pose" value="'+moPt(v)+'"> %</span>':'')+'</div>';
    }
    function ruThen(r){
      const k=rKind(r);
      if(k==='data'){
        const x=rFol(r)||{p:'mo'},o=(v,l,c)=>'<option value="'+v+'"'+(v===c?' selected':'')+'>'+l+'</option>';
        if(x.p==='text')return '<p class="rlb">Value on the label</p><p class="hint" data-live="rv">'+esc(folText(r))+'</p>'+
          '<p class="hint">Entity and format are set from the label: Settings › show: value.</p>';
        let h='<label class="f col">effect<select class="num" data-rx="p" aria-label="Effect">'+
          BIND_M.concat(isBind(x)&&BIND_M.indexOf(x.p)<0?[x.p]:[]).map(q=>o(q,BIND_L[q],x.p)).join('')+'</select></label>';
        if(isBind(x)){
          const I=bindIn(x),O=bindOut(x),k=rCs(r)[0],h2=self._hass,st=h2&&h2.states&&k&&h2.states[k.e];
          const u=st&&!k.a?(st.attributes||{}).unit_of_measurement||'':'',U=BIND_U[x.p];
          const nf=(w,v,step)=>'<input class="num" data-rx="'+w+'" type="number" step="'+(step||'any')+'" value="'+esc(String(f(v)))+'">';
          const row=(l,a2,b2,un)=>'<div class="evq bnd"><span>'+l+'</span>'+a2+'<span>→</span>'+b2+'<span>'+esc(un||'')+'</span></div>';
          if(x.p==='mo'){
            const A=styles().filter(q=>isAn(q)&&q.anim==='custom'),d=moDrv(x);
            h+='<label class="f">motion<select class="num'+(d?'':' miss')+'" data-rx="mo" data-miss="n" style="width:auto" aria-label="Motion">'+(d?'':'<option value="" selected>—</option>')+
              A.map(q=>'<option value="'+q.id+'"'+(d&&q.id===d.id?' selected':'')+'>'+esc(q.n||'(unnamed)')+'</option>').join('')+'<option value="+">new motion</option></select></label>';
            h+=row('value',nf('i0',I[0]),nf('i1',I[1]),u);
            h+='<label class="f">smooth<span><input class="num" data-rx="tm" type="number" min="0" step="50" style="width:64px" value="'+bindTm(x)+'"> ms</span></label>';
            return h+'<p class="hint" data-live="rv">'+esc(folText(r))+'</p>';
          }
          h+=row('value',nf('i0',I[0]),nf('i1',I[1]),u);
          if(x.p==='fc'){
            const cf=(w,v,j)=>'<span class="clr"><input type="color" data-rx="'+w+'" value="'+esc(v)+'" aria-label="Color"><input class="num" type="range" min="0" max="1" step="0.05" data-rx="oa'+j+'" value="'+bindA(x,j)+'" aria-label="Color opacity"></span>';
            h+=row('color',cf('o0',O[0],0),cf('o1',O[1],1),'');
          }
          else h+=row(BIND_L[x.p].replace('motion ',''),nf('o0',O[0],x.p==='op'?'0.05':'1'),nf('o1',O[1],x.p==='op'?'0.05':'1'),U);
          if(bindTf(x))h+='<div class="f">pivot<div class="pvg" role="group" aria-label="Pivot">'+PIV.map(q=>'<button type="button" data-rpv="'+q[0]+'" title="'+q[1]+'" aria-label="'+q[1]+'" aria-pressed="'+((x.pv||'c')===q[0])+'"></button>').join('')+'</div></div>';
          if(x.p==='sp'){
            const A=styles().filter(isAn);
            h+='<label class="f">motion<select class="num'+(isAn(stById(+x.an))?'':' miss')+'" data-rx="an" data-miss="n" style="width:auto" aria-label="Motion">'+(isAn(stById(+x.an))?'':'<option value="" selected>—</option>')+
              A.map(q=>'<option value="'+q.id+'"'+(q.id===+x.an?' selected':'')+'>'+esc(q.n||'(unnamed)')+'</option>').join('')+'</select></label>';
          }
          if(x.p!=='sp'&&x.p!=='fv')h+='<label class="f">smooth<span><input class="num" data-rx="tm" type="number" min="0" step="50" style="width:64px" value="'+bindTm(x)+'"> ms</span></label>';
          return h+'<p class="hint" data-live="rv">'+esc(folText(r))+'</p>';
        }
        return h+'<p class="hint" data-live="rv">'+esc(folText(r))+'</p>';
      }
      if(k==='tap'){
        const v=actMo(r),x=fxOf(r,'act')||{a:''},a=fxOf(r,'act')?actA(x):v?'mo':'',mm=rMiss(r),two=a==='sty'&&!!v;
        const fl=two?' style="flex:1;min-width:0"':'';
        const head=(s,w)=>'<label class="f col">action'+(two?'<span class="slr">'+s+'<button type="button" class="evb" data-ra2del="'+w+'" title="Remove action" aria-label="Remove action">✕</button></span>':s)+'</label>';
        const s0='<select class="num'+(a?'':' lkadd stadd'+(mm.x?' miss':''))+'" data-rx="a" data-miss="x" aria-label="Action"'+fl+'>'+(a?'':plusOpt('+ action'))+
          Object.keys(ACT_L).filter(q=>q!=='page'||hasPgs()||a==='page').map(q=>'<option value="'+q+'"'+(q===a?' selected':'')+'>'+ACT_L[q]+'</option>').join('')+'</select>';
        let h=a?head(s0,'sty'):s0;
        if(a==='page'){
          const own=PG_TT.indexOf(x.tt)>=0,T=pgTr(x),D=own&&PG_DIR[T.t],P=pgOf(x.pg);
          h+='<select class="num'+(P?'':' lkadd stadd miss')+'" data-rx="pg" aria-label="Page" style="margin-bottom:4px">'+(P?'':plusOpt('+ page'))+
              PGS().map(q=>'<option value="'+q.id+'"'+(q===P?' selected':'')+'>'+esc(pgName(q))+'</option>').join('')+'</select>'+
            '<div class="row" style="margin-bottom:4px">'+pgTrFields('rx',own?T:null,true)+'</div>'+
            '<p class="hint" data-live="ra">'+esc(actText(r))+'</p>';
        }
        if(a==='nav')h+='<input class="num" data-rx="u" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="/lovelace/0" aria-label="Address" value="'+esc(x.u||'')+'">'+
          '<p class="hint" data-live="ra">'+esc(actText(r))+'</p>';
        if(a==='toggle'||a==='info')h+='<input class="num" data-rx="act" type="text"'+pickAttrs('ents','entity')+' aria-label="'+(a==='info'?'Entity':'Entity to switch')+'" value="'+esc(x.e||'')+'">';
        if(a==='svc')h+='<input class="num" data-rx="svc" type="text"'+pickAttrs('svcs','service: light.turn_on')+' aria-label="Service" value="'+esc(x.svc||'')+'" style="margin-bottom:4px">'+
          '<input class="num" data-rx="act" type="text"'+pickAttrs('ents','entity (optional)')+' aria-label="Entity" value="'+esc(x.e||'')+'" style="margin-bottom:4px">'+
          '<textarea class="num" data-rx="sd" rows="3" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Service data" placeholder="brightness: 120">'+esc(x.d||'')+'</textarea>';
        if(a==='toggle'||a==='info'||a==='svc')h+='<p class="hint" data-live="ra">'+esc(actText(r))+'</p>';
        if(a==='sty'){
          const L=styles().filter(q=>q&&!isAn(q)),on=idsStys(x.sty).filter(q=>!isAn(q)).reverse(),off=L.filter(q=>on.indexOf(q)<0),SA=q=>soAttr('a:'+r.id,on,q);
          h+=on.map(q=>'<div class="slr sty"'+SA(q).a+'><span class="nm">'+esc(q.n||'(unnamed)')+SA(q).w+'</span><button class="btn" type="button" data-sted="'+q.id+'">Edit</button>'+
              '<button type="button" class="evb" data-rasdel="'+q.id+'" title="Remove style" aria-label="Remove style">✕</button></div>').join('')+
            '<select class="num lkadd stadd'+(mm.t?' miss':'')+'" data-radd="as" data-miss="t" aria-label="Add style">'+lookOpts(off,true,'s')+'</select>';
        }
        if(a==='mo')h+=mvHTML(r,v,mm);
        if(two)h+='<hr class="rsep">'+head('<select class="num" aria-label="Action"'+fl+'><option selected>'+ACT_L.mo+'</option></select>','mo')+mvHTML(r,v,mm);
        if(a==='sty'&&!v||a==='mo')h+='<hr class="rsep"><select class="num lkadd stadd a2" data-rx="a2" aria-label="Add action">'+plusOpt('+ action')+
          '<option value="'+(a==='sty'?'mo':'sty')+'">'+ACT_L[a==='sty'?'mo':'sty']+'</option></select>';
        return h;
      }
      const L=styles().filter(Boolean),on=idsStys(rSty(r)).reverse(),mt=rMiss(r).t;
      return [['s',x=>!isAn(x)],['a',isAn]].map(([kd,ok])=>{
        const D=on.filter(ok),off=L.filter(x=>ok(x)&&on.indexOf(x)<0),SA=x=>soAttr('r:'+r.id,D,x),w=kd==='a'?'motion':'style';
        return D.map(x=>'<div class="slr sty"'+SA(x).a+'><span class="nm">'+esc(x.n||'(unnamed)')+SA(x).w+'</span><button class="btn" type="button" data-sted="'+x.id+'">Edit</button>'+
            '<button type="button" class="evb" data-rsdel="'+x.id+'" title="Remove '+w+'" aria-label="Remove '+w+'">✕</button></div>').join('')+
          '<select class="num lkadd stadd'+(mt?' miss':'')+'" data-radd="s" data-miss="t" aria-label="Add '+w+'">'+lookOpts(off,true,kd)+'</select>';
      }).join('')+
        (phNames(rObjs(r)).length||(fxOf(r,'pho')||{}).n?'<label class="f col">show photo'+phSel(r,'pho',(fxOf(r,'pho')||{}).n||'','none')+'</label>':'')+
        (rObjs(r).some(o=>o.t==='icon')||rSymI(r)?'<label class="f col">icon symbol<input class="num" data-rx="sym" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="mdi:lightbulb-on" value="'+esc(rSymI(r))+'"></label>':'');
    }
    function rTouch(r){
      const O=rObjs(r),B=rBgs(r);if(!O.length&&!B.length)return '';
      const t=O.length?'Touches '+O.length+(O.length===1?' object: ':' objects: ')+O.slice(0,6).map(s=>s.n||s.id).join(', ')+(O.length>6?', …':''):'';
      const k=rKind(r),bt=B.length?(k&&k!=='cond'?'background layers are only for rules with conditions':'background '+(B.length===1?'layer: ':'layers: ')+B.map(b=>b.n||b.id).join(', ')):'';
      return [t,bt].filter(Boolean).join(' · ');
    }
    function ruAddC(r){
      const kd=rKind(r);if(kd&&kd!=='cond')return '';
      const onlyBg=rOn(r).length>0&&rOn(r).every(id=>!!bgOf(id)),noD=kd||onlyBg||rOn(r).some(id=>isCard(objOf(id))),noT=kd||onlyBg;
      const ord={cond:0,data:1,tap:2};
      const free=CAUS().filter(k=>r.c.indexOf(k.id)<0&&(k.k==='cond'||k.k==='data'&&!noD||k.k==='tap'&&!noT)).sort((a,b)=>ord[a.k]-ord[b.k]||(a.k==='tap'?TAP_G.indexOf(tapG(a))-TAP_G.indexOf(tapG(b)):0));
      const lab=k=>k.n&&String(k.n).trim()?k.n+' · '+cAuto(k):cAuto(k);
      return '<select class="num lkadd stadd'+(rMiss(r).w?' miss':'')+'" data-radd="c" data-miss="w" aria-label="Add cause">'+plusOpt('+ cause')+
        (free.length?'<optgroup label="existing">'+free.map(k=>'<option value="'+k.id+'">'+esc(lab(k))+'</option>').join('')+'</optgroup>':'')+
        '<optgroup label="new"><option value="+">condition</option>'+(noD?'':'<option value="+d">value</option>')+
        (noT?'':TAP_G.filter(g=>!tapCause(g)).map(g=>'<option value="+t'+(g==='tap'?'':':'+g)+'">'+(SW_A[g]?'swipe '+SW_A[g]:'tap')+'</option>').join(''))+'</optgroup></select>';
    }
    function tgtList(ids,del,w,miss,plus,mm){
      const tg=ids.map(tgtOf).filter(Boolean);
      return tg.map(o=>'<div class="rch tg"><button type="button" class="rcn" data-tgo="'+esc(o.id)+'">'+esc(tgtName(o))+'<small>'+esc(tgtSub(o))+'</small></button>'+
          '<button type="button" class="evb" '+del+'="'+esc(o.id)+'" title="Remove" aria-label="Remove">✕</button></div>').join('')+
        '<button type="button" class="btn add'+(mm[miss]?' miss':'')+'" data-tgw="'+w+'" data-miss="'+miss+'">'+plus+'</button>';
    }
    function ruRuleHTML(r){
      const K=rCs(r),jv=rOr(r)?'or':'and';
      let h='<label class="f col">name<input class="num" data-rf="n" type="text" autocomplete="off" placeholder="'+esc(rAuto(r))+'" value="'+esc(r.n||'')+'"></label>'+
        '<p class="hint" data-live="rs" style="margin:-3px 0 4px">'+esc(rState(r))+'</p>';
      const m=rMiss(r),kd=rKind(r);
      let w='';
      if(K.length>1)w+='<label class="f col">causes<select class="num" data-rf="j" aria-label="Join causes">'+
        '<option value="and"'+(jv==='and'?' selected':'')+'>all true (AND)</option><option value="or"'+(jv==='or'?' selected':'')+'>any true (OR)</option></select></label>';
      w+=K.map(k=>cBlock(k,'r')).join('');
      const nk=drC&&drC.r===r.id?drC.k:null;
      if(nk)w+=cBlock(nk,'n');
      if(kd==='tap')w+='<p class="rlb">'+tapOnL(K[0])+'</p>'+tgtList(rOn(r),'data-rtdel','t','o','+ object',m);
      h+=tbx('When',w+(nk?'':ruAddC(r)),'',rOut(r));
      h+=tbx(!kd||kd==='cond'?'Then look':'Then',ruThen(r));
      if(kd!=='tap')h+=tbx('On',tgtList(rOn(r),'data-rtdel','t','o','+ target',m)+'<p class="hint" data-live="ro">'+esc(rTouch(r))+'</p>');
      else{
        const x=actSty(r),v=actMo(r);
        if(x||v)h+=tbx('On',tgtList((x||v).to||[],'data-raodel','ao',x?'a':'m','+ object',m));
      }
      if(r===drR)h+='<div class="row rdr"><button class="btn" type="button" data-drx>Cancel</button><button class="btn go" type="button" data-drok'+(drOkay()?'':' disabled')+'>Create</button></div>';
      return h;
    }
    const drOkay=()=>!!drR&&!(drC&&drC.r===drR.id)&&rOk(drR);
    function ruCauseHTML(k){
      const U=cUsers(k);
      if(kDr(k))return cBlock(k,'c')+'<div class="row rdr"><button class="btn" type="button" data-dcx>Cancel</button><button class="btn go" type="button" data-dcok'+(cNewOk(k)?'':' disabled')+'>Create</button></div>';
      return cBlock(k,'c')+tbx('Used by',U.length?'<div class="evu">'+U.map(r=>'<button type="button" data-ru="'+r.id+'">'+esc(rName(r))+'</button>').join('')+'</div>'
        :'<p class="hint">No rules use it</p>');
    }
    function ruPanel(){
      const n=E.rupanel,r=ruleOf(ruCur),k=r?null:causeOf(ruCur);
      let key;
      if(r){
        const tn=rOn(r).map(id=>{const o=tgtOf(id);return o?tgtName(o)+'/'+tgtSub(o):'';});
        const x=rFol(r),ax=fxOf(r,'act'),mv=actMo(r);
        key='r|'+r.id+'|'+JSON.stringify([x?[x.pv||'',x.an||'']:0,mv?[mv.mo||[],mv.to||[],moGo(mv)]:0,ax?[actA(ax),ax.sty||[],ax.to||[],ax.tt||'',pgTr(ax).t,pgOf(ax.pg)?1:0]:0,PGS().map(q=>q.id+q.n),r.c,r.j||'',rSty(r),r.on,tn,rCs(r).map(k=>[k.k,k.op==='btw',cUsers(k).length,k.a||'',!!simOf(k.e),simBri(k)]),
          CAUS().filter(q=>r.c.indexOf(q.id)<0).map(q=>q.id+q.k+cName(q)),styles().filter(Boolean).map(x=>x.id+':'+x.n),
          (S.groups||[]).map(G=>G.id+G.n+members(G.id).length),S.objects.map(s=>s.id+s.n+phNames([s]).join('/')),BGS().map(b=>b.id+b.n),rKind(r),x&&x.p,TAP_G.map(g=>!!tapCause(g)).join(),r.c.filter(id=>ruX.has(id)),r===drR,drC&&drC.r===r.id?[drC.k.id,drC.k.k,drC.k.op==='btw',drC.k.a||'']:0]);
      }else if(k)key='c|'+k.id+'|'+JSON.stringify([k.k,k.op==='btw',cUsers(k).map(q=>q.id+rName(q)),k.a||'',!!simOf(k.e),simBri(k),kDr(k)]);
      else key='-';
      if(n._k!==key){
        n._k=key;
        n.innerHTML=r?ruRuleHTML(r):k?ruCauseHTML(k):'<p class="hint">'+(RULS().length||CAUS().length?'Choose a rule or a cause in the list':'')+'</p>';
        return;
      }
      ruLive(n);
    }
    function ruLive(n){
      const r=ruleOf(ruCur);
      const set=(el,t)=>{if(el&&el.textContent!==t)el.textContent=t;};
      if(r){
        set(n.querySelector('[data-live="rs"]'),rState(r));set(n.querySelector('[data-live="ro"]'),rTouch(r));
        const mm=rMiss(r);n.querySelectorAll('[data-miss]').forEach(q=>{const on=!!mm[q.dataset.miss];if(q.classList.contains('miss')!==on)q.classList.toggle('miss');});
        const dk=n.querySelector('[data-drok]');if(dk){const d=!drOkay();if(dk.disabled!==d)dk.disabled=d;}
        set(n.querySelector('[data-live="rv"]'),folText(r));set(n.querySelector('[data-live="ra"]'),actText(r));
        n.querySelectorAll('[data-rx]').forEach(i=>{
          if(i===root.activeElement)return;
          if(i.dataset.rx==='a2')return;
          if(i.dataset.rx==='md'||i.dataset.rx==='pt'||i.dataset.rx==='mm'){
            const m=actMo(r),o=m&&idsStys(m.mo).find(isAn),q=!m?'':i.dataset.rx==='mm'?(o?String(o.id):''):i.dataset.rx==='md'?(moGo(m)?'g':'p'):String(moPt(m));
            if(i.value!==q)i.value=q;return;
          }
          if(i.dataset.rx==='a'&&!fxOf(r,'act')){const q=actMo(r)?'mo':'';if(i.value!==q)i.value=q;return;}
          const w=i.dataset.rx,pq=w==='pg'||w==='tt'||w==='tdir'||w==='tms',ac=w==='act'||w==='a'||w==='svc'||w==='sd'||w==='u'||pq,x=w==='sym'?fxOf(r,'sym'):ac?fxOf(r,'act'):w==='pho'?fxOf(r,'pho'):rFol(r);
          const T=pq&&x?pgTr(x):null;
          const bx=!ac&&w!=='sym'&&w!=='pho'&&isBind(x)?({i0:bindIn(x)[0],i1:bindIn(x)[1],o0:bindOut(x)[0],o1:bindOut(x)[1],tm:bindTm(x),oa0:bindA(x,0),oa1:bindA(x,1)})[w]:undefined;
          if(bx!==undefined){const v2=typeof bx==='number'?String(f(bx)):String(bx);if(i.value!==v2)i.value=v2;return;}
          const v=w==='sym'?rSymI(r):pq?(!x?'':w==='pg'?(pgOf(x.pg)?x.pg:''):w==='tt'?(PG_TT.indexOf(x.tt)>=0?T.t:''):w==='tdir'?T.d:String(T.ms)):ac?(!x?'':w==='a'?actA(x):w==='svc'?x.svc||'':w==='sd'?x.d||'':w==='u'?x.u||'':x.e||''):w==='pho'?(x&&x.n||''):x&&x[w]!=null?String(x[w]):'';
          if(i.value!==v)i.value=v;
        });
        const nm=n.querySelector('[data-rf="n"]');if(nm){if(nm!==root.activeElement&&nm.value!==(r.n||''))nm.value=r.n||'';const p=rAuto(r);if(nm.placeholder!==p)nm.placeholder=p;}
      }
      n.querySelectorAll('[data-cid]').forEach(b=>{
        const k=causeOf(b.dataset.cid);if(!k)return;
        set(b.querySelector('[data-live="ct"]'),k.k==='tap'?cText(k):cEnt(k));set(b.querySelector('[data-live="cn"]'),cName(k));
        const on=k.k==='cond'&&cNow(k),f=k.k!=='tap'&&!!simOf(k.e);
        if(b.classList.contains('rck')){const m=kDr(k)?!cNewOk(k):!!r&&!b.classList.contains('rcc')&&!cDone(k);if(b.classList.contains('miss')!==m)b.classList.toggle('miss');}
        if(b.classList.contains('on')!==on)b.classList.toggle('on');
        if(b.classList.contains('frc')!==f)b.classList.toggle('frc');
        const cv=b.querySelector('[data-live="cvo"]');if(cv){const hd=!cValOffer(k);if(cv.hidden!==hd)cv.hidden=hd;}
        b.querySelectorAll('[data-cf]').forEach(i=>{
          if(i===root.activeElement)return;
          const fl=i.dataset.cf;
          if(fl==='a'){const t=evAttrOpts(k);if(i._h!==t){i._h=t;i.innerHTML=t;}return;}
          if(fl==='n'){const p=cAuto(k);if(i.placeholder!==p)i.placeholder=p;}
          if(fl==='v'){const p=cVal(k);if(i.placeholder!==p)i.placeholder=p;}
          const v=k[fl]==null?'':String(k[fl]);if(i.value!==v)i.value=v;
        });
      });
      n.querySelectorAll('[data-co]').forEach(t=>{const k=causeOf(t.dataset.co);if(k)set(t.querySelector('b'),cOut(k));});
      n.querySelectorAll('[data-ro]').forEach(t=>{const q=ruleOf(t.dataset.ro);if(!q)return;set(t.querySelector('b'),rOutV(q));const c=rOutC(q);if(t.className!==c)t.className=c;});
      n.querySelectorAll('[data-dcok]').forEach(b=>{const d=!(drC&&cNewOk(drC.k));if(b.disabled!==d)b.disabled=d;});
    }
    function rbarRefresh(){
      const r=ruleOf(ruCur),k=r?null:causeOf(ruCur);
      const on={dup:!!(r&&r!==drR||k&&k.k!=='tap'&&!kDr(k)),del:!!(r||k),up:!!ruNext(r,-1),down:!!ruNext(r,1)};
      E.rbar.querySelectorAll('[data-rb]').forEach(b=>{const v=on[b.dataset.rb];if(v!==undefined&&b.disabled===v)b.disabled=!v;});
    }
    function ruNext(r,d){
      const L=RULS();if(!r||r===drR)return null;
      for(let j=L.indexOf(r)+d;j>=0&&j<L.length;j+=d)if(ruVis(L[j]))return L[j];
      return null;
    }
    function ruAct(w){
      settle();
      const r=ruleOf(ruCur),k=r?null:causeOf(ruCur);
      if(w==='newr'){const d=drNew(selUnitIds());if(!d)return;ruCur=d.id;render();return;}
      if(r===drR){if(w==='del')drRX();return;}
      if(kDr(k)){if(w==='del')drCX();return;}
      else if(w==='dup'){
        if(r){const x=clone(r);x.id=newId('r',RULS());if(x.n)x.n+=' copy';S.rules.splice(RULS().indexOf(r)+1,0,x);ruCur=x.id;}
        else if(k&&k.k!=='tap'){const x=clone(k);x.id=newId('c',CAUS());if(x.n)x.n+=' copy';S.causes.push(x);ruCur=x.id;}
        else return;
      }
      else if(w==='up'||w==='down'){
        const q=ruNext(r,w==='up'?-1:1);if(!q)return;
        const L=RULS(),i=L.indexOf(r),j=L.indexOf(q);
        L[i]=q;L[j]=r;
      }
      else if(w==='del'){
        if(r){const L=RULS(),i=L.indexOf(r);L.splice(i,1);ruCur=(L[i]||L[i-1]||{id:''}).id;}
        else if(k){
          const U=cUsers(k),gone=U.filter(q=>q.c.length===1);
          if(U.length&&!confirm('Delete cause “'+cName(k)+'”? '+U.length+(U.length===1?' rule uses it':' rules use it')+
            (gone.length?'; '+gone.length+(gone.length===1?' rule is':' rules are')+' left without causes and deleted':'')+'.'))return;
          U.forEach(q=>{q.c=q.c.filter(id=>id!==k.id);});
          S.rules=RULS().filter(q=>gone.indexOf(q)<0);S.causes=CAUS().filter(q=>q!==k);ruCur='';
        }
        else return;
      }
      else return;
      render();store(true);
    }
    E.rbar.addEventListener('click',e=>{const b=e.target.closest('[data-rb]');if(b&&!b.disabled)ruAct(b.dataset.rb);});
    function ruOpen(id){if(flow)flShow(null);ruCur=id;selRu=true;selTe=false;selSt=false;selBg=false;selG=-1;lastShown='';render();}
    E.rupanel.addEventListener('input',e=>{
      const t=e.target,r=ruleOf(ruCur);
      if(t.dataset.rf&&r){
        if(t.dataset.rf==='n'){const v=t.value.replace(/[\r\n]+/g,' ');if(v.trim())r.n=v;else delete r.n;render();store();return;}
        settle();if(t.value==='or')r.j='or';else delete r.j;render();store(true);return;
      }
      if(t.dataset.radd&&r){
        const v=t.value,w=t.dataset.radd;if(!v)return;
        settle();
        if(w==='c'){
          if(v==='+'||v==='+d'){drCNew(r,v==='+d'?'data':'cond');render();return;}
          let k;
          const g=v==='+t'?'tap':v.indexOf('+t:')===0&&SW_L[v.slice(3)]?v.slice(3):'';
          if(g&&r===drR&&!tapCause(g)){k=tapNew('xc'+(++drN),g);drK.push(k);}
          else k=g?newCause('tap','',g):causeOf(v);
          rAddCause(r,k);
        }
        else if(w==='s'){
          const x=rLook(r),id=stMake(v);
          if(x.sty.indexOf(id)<0)x.sty.push(id);
        }
        else if(w==='as'){
          const x=actSty(r);if(!x)return;
          const id=stMake(v);
          if(!Array.isArray(x.sty))x.sty=[];if(x.sty.indexOf(id)<0)x.sty.push(id);
        }
        render();store(true);return;
      }
      if(t.dataset.rx&&r){
        const w=t.dataset.rx,disc=t.tagName==='SELECT';
        if(disc)settle();
        if(w==='sym'){
          const v=t.value.trim();
          if(v){let x=fxOf(r,'sym');if(!x){x={k:'sym',icon:''};r.fx.push(x);}x.icon=v;}
          else r.fx=r.fx.filter(x=>x.k!=='sym');
        }
        else if(w==='md'||w==='pt'||w==='mm'){
          const x=actMo(r);if(!x)return;
          if(w==='mm'){if(!t.value)return;x.mo=[stMake(t.value)];}
          else if(w==='md'){if(t.value==='g')x.md='g';else{delete x.md;delete x.pt;}}
          else{const v=Math.round(parseFloat(t.value));if(!isFinite(v))return;x.pt=clamp(v,0,100);}
        }
        else if(w==='a2'){
          const a=actSty(r),v=actMo(r);
          if(t.value==='mo'&&a&&!v)r.fx.push({k:'mv',mo:[],to:(a.to||[]).slice()});
          else if(t.value==='sty'&&v&&!a)r.fx.unshift({k:'act',a:'sty',sty:[],to:(v.to||[]).slice()});
          else return;
        }
        else if(w==='a'&&(t.value==='mo'||actMo(r)&&!fxOf(r,'act'))){
          const x=fxOf(r,'act'),v=actMo(r),to=(v?v.to:x&&actA(x)==='sty'?x.to:rOn(r))||[];
          if(t.value==='mo'){r.fx=r.fx.filter(q=>q.k!=='act');if(!v)r.fx.push({k:'mv',mo:[],to:to.slice()});}
          else{
            r.fx=r.fx.filter(q=>q.k!=='mv');
            const y={k:'act'};if(t.value==='toggle'){y.e=tapGuess(rOn(r));}else if(t.value==='info'){y.a='info';y.e=tapGuess(rOn(r),true);}else{y.a=t.value;if(t.value==='sty')y.to=to.slice();}
            if(t.value==='page'){const own=rObjs(r).map(o=>o.pg).find(Boolean)||cpg(),P=PGS().find(q=>q.id!==own)||PGS()[0];y.pg=P?P.id:'';}
            r.fx.push(y);
          }
        }
        else if(w==='act'||w==='a'||w==='svc'||w==='sd'||w==='u'||w==='pg'||w==='tt'||w==='tdir'||w==='tms'){
          let x=fxOf(r,'act');if(!x){x={k:'act',a:''};r.fx.push(x);}
          if(w==='a'&&t.value==='page'&&actA(x)!=='page'){
            const own=rObjs(r).map(o=>o.pg).find(Boolean)||cpg(),P=PGS().find(q=>q.id!==own)||PGS()[0];
            x.a='page';x.pg=P?P.id:'';['tt','tdir','tms'].forEach(q=>{delete x[q];});
          }
          else if(w==='pg'){if(!t.value)return;x.pg=t.value;}
          else if(w==='tt'){if(t.value)x.tt=t.value;else{delete x.tt;delete x.tms;}delete x.tdir;}
          else if(w==='u')x.u=t.value.trim();
          else if(w==='tdir')x.tdir=t.value;
          else if(w==='tms'){const v=Math.round(parseFloat(t.value));if(!(v>0))return;x.tms=clamp(v,50,5000);}
          else if(w==='a'){
            const v=t.value;if(!v)return;
            if(v==='toggle'){delete x.a;if(!x.e)x.e=tapGuess(rOn(r));}
            else if(v==='info'){x.a='info';if(!x.e)x.e=tapGuess(rOn(r),true);}
            else{
              if(v==='sty'&&actA(x)!=='sty'&&!(x.to||[]).length)x.to=rOn(r).slice();
              x.a=v;
            }
          }
          else if(w==='act')x.e=t.value.trim();
          else if(w==='svc')x.svc=t.value.trim();
          else x.d=t.value;
        }
        else if(w==='pho'){
          const v=t.value;
          if(v){let x=fxOf(r,'pho');if(!x){x={k:'pho',n:''};r.fx.push(x);}x.n=v;}
          else r.fx=r.fx.filter(x=>x.k!=='pho');
        }
        else{
          let x=rFol(r);if(!x){x={k:'follow',p:'mo'};r.fx.push(x);}
          if(w==='p'){
            const v=t.value;
            if(BIND.indexOf(v)>=0){
              if(x.p!==v){
                ['map','ph','dec','pre','suf','i0','i1','o0','o1','oa0','oa1','pv','tm','an','mo'].forEach(q=>{delete x[q];});
                x.p=v;const g=bindGuessIn(rCs(r)[0]);x.i0=g[0];x.i1=g[1];
                if(v==='sp'){const a=rObjs(r).map(anOfObj).find(L=>L.length),A=styles().find(isAn);const id=a?a[0]:A&&A.id;if(id)x.an=id;}
              }
            }
            else if(v==='text'){['i0','i1','o0','o1','oa0','oa1','pv','tm','an','mo'].forEach(q=>{delete x[q];});x.p='text';}
          }
          else if(isBind(x)&&['i0','i1','o0','o1','oa0','oa1','tm','an','mo'].indexOf(w)>=0){
            if(t.type==='color'){x[w]=t.value;}
            else if(w==='an'){if(!t.value)return;x.an=+t.value;}
            else if(w==='mo'){
              if(!t.value)return;
              if(t.value==='+'){const m=newAnim(stNewId(),stFreeName('Motion'));m.anim='custom';if(!Array.isArray(S.styles))S.styles=[];S.styles.push(m);x.mo=m.id;}
              else x.mo=+t.value;
            }
            else{
              const raw=t.value.trim(),n=parseFloat(raw);
              if(!raw)delete x[w];
              else if(!isFinite(n))return;
              else{const R2=BIND_R[x.p];x[w]=(w==='o0'||w==='o1')&&R2?clamp(n,R2[0],R2[1]):w==='tm'?clamp(Math.round(n),0,10000):w==='oa0'||w==='oa1'?clamp(n,0,1):n;}
            }
          }
          else if(w==='dec'){const d=Math.round(parseFloat(t.value));if(t.value===''||!(d>=0))delete x.dec;else x.dec=Math.min(6,d);}
          else{const v=t.value;if(w==='map'||v)x[w]=v;else delete x[w];}
        }
        render();store(disc);return;
      }
      const b=t.closest('[data-cid]'),k=b&&causeOf(b.dataset.cid);
      if(!k)return;
      if(!t.dataset.cf)return;
      const f=t.dataset.cf;
      if(f==='k'){
        settle();
        if(t.value==='data'){k.k='data';['op','v','v2'].forEach(q=>{delete k[q];});}
        else{k.k='cond';k.op='=';k.v='';}
        render();store(true);return;
      }
      const disc=t.tagName==='SELECT';
      if(disc)settle();
      if(f==='n'){const v=t.value.replace(/[\r\n]+/g,' ');if(v.trim())k.n=v;else delete k.n;}
      else if(f==='e'){k.e=t.value.trim();if(k.a){const h=self._hass,st=h&&h.states&&h.states[k.e];if(st&&!(k.a in (st.attributes||{})))delete k.a;}}
      else if(f==='a'){if(t.value)k.a=t.value;else delete k.a;}
      else{k[f]=t.value;if(f==='op'&&t.value!=='btw')delete k.v2;}
      render();store(disc);
    });
    E.rupanel.addEventListener('click',e=>{
      const r=ruleOf(ruCur);
      const pvb=e.target.closest('[data-rpv]');
      if(pvb&&r){const x=rFol(r);if(!isBind(x))return;settle();if(pvb.dataset.rpv==='c')delete x.pv;else x.pv=pvb.dataset.rpv;render();store(true);return;}
      const go=e.target.closest('[data-ru]');
      if(go){ruOpen(go.dataset.ru);return;}
      if(e.target.closest('[data-dcok]')){drCOk();return;}
      if(e.target.closest('[data-dcx]')){drCX();return;}
      if(e.target.closest('[data-drok]')){drROk();return;}
      if(e.target.closest('[data-drx]')){drRX();return;}
      const cx=e.target.closest('[data-rcx]');
      if(cx){
        const id=cx.dataset.rcx,t=Date.now();
        if(rcT&&rcT.id===id&&t-rcT.t<350){clearTimeout(rcT.h);rcT=null;cTitle(id);return;}
        if(rcT)clearTimeout(rcT.h);
        rcT={id:id,t:t,h:setTimeout(()=>{
          rcT=null;const k=causeOf(id);if(!k||kDr(k)&&drC&&drC.k===k)return;
          if(ruX.has(id)){if(cDone(k))ruX.delete(id);}else ruX.add(id);E.rupanel._k='';ruPanel();
        },260)};
        return;
      }
      const se=e.target.closest('[data-sted]');
      if(se){stCur=+se.dataset.sted;stGrpCur='';stAn=isAn(stById(stCur));stMs=ms.slice();selRu=false;selTe=false;selBg=false;selSt=true;render();return;}
      const tw=e.target.closest('[data-tgw]');
      if(tw&&r){twOpen(r,tw.dataset.tgw);return;}
      const tgo=e.target.closest('[data-tgo]');
      if(tgo){
        const id=tgo.dataset.tgo,G=grpOf(id);
        if(bgOf(id)){pick([]);selGrp=null;gIn=null;selRu=false;selTe=false;selBg=true;selPg=false;selG=-1;lastShown='';render();return;}
        if(G){const m=members(id);if(!m.length)return;gIn=gpar(id);unfoldTo(id);pickG(m,id);}
        else{const s=S.objects.find(q=>q.id===id);if(!s)return;gIn=s.g==null?null:s.g;pickG([s],null);}
        render();return;
      }
      const cv=e.target.closest('[data-cval]');
      if(cv){
        const k=causeOf(cv.dataset.cval);if(!cValOffer(k))return;
        settle();cToValue(k);render();store(true);stamp('the label shows the value');return;
      }
      if(!r)return;
      const x=e.target.closest('[data-rcdel],[data-rsdel],[data-rtdel],[data-rasdel],[data-raodel],[data-ra2del]');if(!x)return;
      settle();
      const ax=actSty(r),mx=actMo(r);
      if('ra2del' in x.dataset){
        const q=x.dataset.ra2del==='sty'?ax:mx;if(!q||!ax||!mx)return;
        r.fx=r.fx.filter(y=>y!==q);
      }
      else if(x.dataset.raodel)[ax,mx].forEach(q=>{if(q)q.to=(q.to||[]).filter(id=>id!==x.dataset.raodel);});
      else if(x.dataset.rasdel){
        if(!ax)return;
        ax.sty=(ax.sty||[]).filter(id=>id!==+x.dataset.rasdel);
      }
      else if(x.dataset.rcdel)r.c=r.c.filter(id=>id!==x.dataset.rcdel);
      else if(x.dataset.rsdel){const L=rLook(r);L.sty=L.sty.filter(id=>id!==+x.dataset.rsdel);}
      else if(x.dataset.rtdel)r.on=r.on.filter(id=>id!==x.dataset.rtdel);
      render();store(true);
    });

    const TWE={el:root.getElementById('tgw'),t:root.getElementById('tgwt'),s:root.getElementById('tgws'),l:root.getElementById('tgwl'),
      x:root.getElementById('tgwx'),ok:root.getElementById('tgwok')};
    const twHost=()=>E.detail.closest('aside')||E.fdock;
    const twIds0=(r,w)=>w==='t'?rOn(r):((actSty(r)||actMo(r)||{}).to||[]);
    const twOk=id=>TW.cd||!isCard(objOf(id));
    const twCov=id=>{const G=grpOf(id),o=G?null:objOf(id);return (G?chainG(id).slice(1):o?chainOf(o):[]).some(g=>TW.chk.has(g));};
    const twRes=()=>[...TW.chk].filter(id=>tgtOf(id)&&!twCov(id)&&twOk(id));
    const twKey=L=>L.slice().sort().join(' ');
    const twFold=t=>String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
    function twTree(L){
      const top=[],open=[];
      L.forEach(o=>{
        const ch=chainOf(o).slice().reverse();
        let k=0;while(k<open.length&&k<ch.length&&open[k].g===ch[k])k++;
        open.length=k;
        for(let j=k;j<ch.length;j++){const n={g:ch[j],kids:[]};(j?open[j-1].kids:top).push(n);open.push(n);}
        (ch.length?open[ch.length-1].kids:top).push({o:o});
      });
      return top;
    }
    const twAll=t=>t.flatMap(n=>n.o?[n.o.id]:[n.g].concat(twAll(n.kids)));
    function twSecs(){
      const O=S.objects.slice().reverse(),out=[];
      if(hasPgs()){
        out.push({k:'c',n:'all pages',t:twTree(O.filter(o=>!o.pg))});
        PGS().forEach(p=>out.push({k:p.id,n:pgName(p)+(p.id===cpg()?' · this page':''),t:twTree(O.filter(o=>o.pg===p.id))}));
      }else out.push({k:'o',n:'',t:twTree(O)});
      if(BGS().length)out.push({k:'l',n:'layers',t:BGS().slice().reverse().map(b=>({o:b}))});
      return out.filter(x=>x.t.length);
    }
    const twSec=o=>isBgl(o)?'l':!hasPgs()?'o':o.pg||'c';
    function twOpen(r,w){
      if(TW)twClose(false);
      const ids=twIds0(r,w);
      TW={r:r.id,w:w,cd:w==='t'&&rKind(r)!=='tap'?cdOk(r):true,chk:new Set(ids),c0:twKey(ids),fold:new Set(),sfold:new Set(),q:'',hv:null,host:twHost(),pj:proj};
      twSecs().forEach(x=>{if(x.k!=='c'&&x.k!=='o'&&x.k!==cpg()&&!twAll(x.t).some(id=>TW.chk.has(id)))TW.sfold.add(x.k);});
      TWE.t.textContent=w==='t'&&rKind(r)==='tap'?tapOnL(rCs(r)[0]).replace(/^./,c=>c.toUpperCase()):'On';
      TWE.s.value='';
      TW.host.classList.add('twon');TW.host.appendChild(TWE.el);TWE.el.hidden=false;
      cv.classList.add('twp');
      twDraw();req();
      if(!coarse)TWE.s.focus();
    }
    function twClose(ok){
      if(!TW)return;
      const T=TW,r=ruleOf(T.r),L=twRes();
      TW=null;TWE.el.hidden=true;T.host.classList.remove('twon');cv.classList.remove('twp');
      if(ok&&r&&twKey(L)!==T.c0){
        settle();
        if(T.w==='t')r.on=L;
        else [actSty(r),actMo(r)].forEach(x=>{if(x)x.to=L.slice();});
        render();store(true);return;
      }
      req();
    }
    function twSync(){
      if(!TW)return;
      const r=ruleOf(TW.r);
      if(!r||ruCur!==TW.r||TW.pj!==proj||TW.host!==twHost()||TW.w==='ao'&&!actSty(r)&&!actMo(r))twClose(false);
      else twDraw();
    }
    function twMark(t,q){
      t=String(t);if(!q)return esc(t);
      const i=twFold(t).indexOf(q);if(i<0)return esc(t);
      return esc(t.slice(0,i))+'<span class="q">'+esc(t.slice(i,i+q.length))+'</span>'+esc(t.slice(i+q.length));
    }
    function twRows(L,d,q,dup){
      let h='';
      L.forEach(n=>{
        if(n.g){
          const G=grpOf(n.g),nm=(G&&G.n)||'(unnamed)',hit=!q||twFold(nm).indexOf(q)>=0,inner=twRows(n.kids,d+1,hit?'':q,dup);
          if(q&&!hit&&!inner)return;
          const c=twCov(n.g),on=TW.chk.has(n.g),pt=!on&&!c&&twAll(n.kids).some(id=>TW.chk.has(id)),cl=!q&&TW.fold.has(n.g);
          h+='<div class="twr g'+(c?' cov':on?' ck':pt?' part':'')+(TW.hv===n.g?' hv':'')+'" data-twi="'+esc(n.g)+'" style="--d:'+d+'" role="treeitem" aria-checked="'+(c||on?'true':pt?'mixed':'false')+'">'+
            '<span class="cb">'+(c||on?'✓':pt?'–':'')+'</span><span class="twf" data-twf="'+esc(n.g)+'">'+(cl?'▸':'▾')+'</span>'+
            '<span class="nm">'+twMark(nm,q)+'</span><span class="gc">'+members(n.g).length+'</span></div>';
          if(!cl)h+=inner;
          return;
        }
        const o=n.o,nm=o.n||'(unnamed)';
        if(q&&twFold(nm).indexOf(q)<0)return;
        const no=!twOk(o.id),c=!no&&twCov(o.id),on=!no&&TW.chk.has(o.id);
        const sy=isBgl(o)?'▣ ':isEl(o)?(o.t==='label'?'T ':'★ '):isCard(o)?'▭ ':o.t==='line'?'╱ ':'';
        h+='<div class="twr'+(no?' no':c?' cov':on?' ck':'')+(TW.hv===o.id?' hv':'')+'" data-twi="'+esc(o.id)+'" style="--d:'+d+'" role="treeitem" aria-checked="'+(c||on)+'"'+
            (no?' aria-disabled="true" title="Cards don\'t follow values"':'')+'>'+
          '<span class="cb">'+(c||on?'✓':'')+'</span><span class="twf"></span><span class="nm">'+esc(sy)+twMark(nm,q)+'</span>'+
          (dup[nm]>1?'<span class="id">'+esc(o.id)+'</span>':'')+'</div>';
      });
      return h;
    }
    function twDraw(){
      if(!TW)return;
      giro(()=>{
        const q=twFold(TW.q.trim()),R=twRes(),dup={};
        S.objects.concat(BGS()).forEach(o=>{const k=o.n||'(unnamed)';dup[k]=(dup[k]||0)+1;});
        let h='';
        twSecs().forEach(x=>{
          const body=twRows(x.t,0,q,dup);if(q&&!body)return;
          if(!x.n){h+=body;return;}
          const all=twAll(x.t),n=R.filter(id=>all.indexOf(id)>=0).length,cl=!q&&TW.sfold.has(x.k);
          h+='<div class="tws" data-tws="'+esc(x.k)+'"><span>'+(cl?'▸':'▾')+'</span>'+esc(x.n)+'<span class="n">'+(n||'')+'</span></div>'+(cl?'':body);
        });
        put(TWE.l,h||'<p class="hint">'+(q?'No matches':'No objects')+'</p>');
        const d=twKey(R)===TW.c0;if(TWE.ok.disabled!==d)TWE.ok.disabled=d;
      });
    }
    function twHv(id){
      if(!TW||TW.hv===id)return;
      TW.hv=id;
      TWE.l.querySelectorAll('.twr.hv').forEach(x=>x.classList.remove('hv'));
      const x=id&&TWE.l.querySelector('[data-twi="'+id+'"]');if(x)x.classList.add('hv');
      req();
    }
    function twPick(s){
      if(!TW||!s||!twOk(s.id)||twCov(s.id))return;
      if(TW.chk.has(s.id))TW.chk.delete(s.id);else TW.chk.add(s.id);
      TW.sfold.delete(twSec(s));chainOf(s).forEach(g=>TW.fold.delete(g));
      TW.q='';TWE.s.value='';TW.hv=s.id;
      twDraw();req();
      const x=TWE.l.querySelector('[data-twi="'+s.id+'"]');
      if(x){const L=TWE.l,t=x.offsetTop,b=t+x.offsetHeight;if(t<L.scrollTop)L.scrollTop=t-4;else if(b>L.scrollTop+L.clientHeight)L.scrollTop=b-L.clientHeight+4;}
    }
    function twOv(){
      if(!TW)return '';
      const T=new Set(),H=new Set(),R=twRes();
      R.forEach(id=>{if(grpOf(id))members(id).forEach(o=>T.add(o));else{const o=objOf(id);if(o)T.add(o);}});
      if(TW.hv){if(grpOf(TW.hv))members(TW.hv).forEach(o=>H.add(o));else{const o=objOf(TW.hv);if(o)H.add(o);}}
      let ov='';
      S.objects.forEach(o=>{
        if(!onPg(o)||vHid(o))return;
        const c=!twOk(o.id)?'twn':H.has(o)?'twh':T.has(o)?'twt':'';if(!c)return;
        const b=bboxOf([o]);if(!isFinite(b.x0))return;
        ov+='<rect class="'+c+'" x="'+f(b.x0)+'" y="'+f(b.y0)+'" width="'+f(b.x1-b.x0)+'" height="'+f(b.y1-b.y0)+'"/>';
      });
      return ov;
    }
    TWE.l.addEventListener('click',e=>{
      if(!TW)return;
      const fd=e.target.closest('[data-twf]');
      if(fd){const id=fd.dataset.twf;if(TW.fold.has(id))TW.fold.delete(id);else TW.fold.add(id);twDraw();return;}
      const sc=e.target.closest('[data-tws]');
      if(sc){const k=sc.dataset.tws;if(TW.sfold.has(k))TW.sfold.delete(k);else TW.sfold.add(k);twDraw();return;}
      const x=e.target.closest('[data-twi]');
      if(!x||x.classList.contains('cov')||x.classList.contains('no'))return;
      const id=x.dataset.twi;if(TW.chk.has(id))TW.chk.delete(id);else TW.chk.add(id);
      twDraw();req();
    });
    TWE.l.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const x=e.target.closest('[data-twi]');twHv(x?x.dataset.twi:null);});
    TWE.l.addEventListener('pointerleave',()=>twHv(null));
    TWE.s.addEventListener('input',()=>{if(TW){TW.q=TWE.s.value;twDraw();}});
    TWE.x.addEventListener('click',()=>twClose(false));
    TWE.ok.addEventListener('click',()=>twClose(true));

    const bhBox=()=>'<div id="bhx"></div>';
    let bhRep=null;
    function bhTarget(){
      if(selGrp!=null&&grpOf(selGrp))return grpOf(selGrp);
      return ms.length===1&&sel>=0&&S.objects[sel]?S.objects[sel]:null;
    }
    function bhPanel(){
      const n=E.insp.querySelector('#bhx');if(!n)return;
      if(n.children.length!==4)n.innerHTML='<div></div><div></div><div></div><div></div>';
      const o=bhTarget(),EN=o?bhEnts(o):[],open=!!o&&bhRep===o.id&&EN.length>0;
      const top='<button class="btn add" type="button" data-bh="rule" style="margin:8px 0 6px">+ rule</button><div class="row" style="margin-bottom:8px">'+
        (o&&hasPgs()?'<select class="num" data-bh="pg" style="width:auto" aria-label="Go to page"><option value="">go to page…</option>'+
          PGS().map(q=>'<option value="'+q.id+'">'+esc(pgName(q))+'</option>').join('')+'</select>':'')+
        (EN.length?'<button class="btn" type="button" data-bh="rep" aria-pressed="'+open+'">Replace entity…</button>':'')+'</div>';
      const ent=open?'<div class="bhe">'+EN.map(([e,u])=>'<input class="num" type="text" data-bhe="'+esc(e)+'" value="'+esc(e)+'"'+pickAttrs('ents')+
        ' title="'+u+(u===1?' rule':' rules')+'" aria-label="Replace '+esc(e)+'">').join('')+'</div>':'';
      let h='';
      if(o){
        const L=rulesOn(o),own=isGrp(o)?chainG(o.id).slice(1):chainOf(o);
        h=L.length?'<div class="bhl">'+L.map(r=>{
          const via=rOn(r).indexOf(o.id)>=0?'':own.find(id=>rOn(r).indexOf(id)>=0),G=via?grpOf(via):null,p=rProblems(r).length;
          return '<button type="button" class="bhr'+(!p&&rNow(r)?' on':'')+(rForced(r)?' f':'')+'" data-ru="'+r.id+'"><b>'+esc(rName(r))+'</b>'+ignTri(rIgn(r))+
            '<small>'+(RULS().indexOf(r)+1)+' · '+(G?'from group '+esc(G.n||G.id):isGrp(o)?'this group':'this object')+(p?' · ⚠ incomplete':rNow(r)?' · ● active':'')+'</small></button>';
        }).join('')+'</div>':'<p class="hint">No rules</p>';
      }
      [thruBox(o),h,top,ent].forEach((x,i)=>{const p=n.children[i];if(p._h!==x){p._h=x;p.innerHTML=x;}});
      const tc=n.querySelector('[data-bh="thru"]');if(tc)tc.indeterminate=tc.dataset.mix==='1';
    }
    const thruZs=o=>(isGrp(o)?members(o.id):[o]).filter(s=>kindOf(s)==='z');
    function thruBox(o){
      const Z=o?thruZs(o):[];if(!Z.length)return '';
      const dis=Z.every(gstAny),on=!dis&&Z.every(s=>s.thru===true),mix=!dis&&!on&&Z.some(s=>s.thru===true);
      return '<label class="chk" style="margin:-2px 0 8px"'+(dis?' title="'+(Z.length>1?'Every zone has':'The zone has')+' a tap action"':'')+'><input type="checkbox" data-bh="thru"'+
        (on?' checked':'')+(dis?' disabled':'')+' data-mix="'+(mix?1:0)+'">tap passes through</label>';
    }
    function bhSet(o){
      const U=new Set([o.id]);
      if(isGrp(o)){(S.groups||[]).forEach(G=>{if(chainG(G.id).indexOf(o.id)>=0)U.add(G.id);});members(o.id).forEach(s=>U.add(s.id));}
      return U;
    }
    const bhUses=(r,e)=>rCs(r).some(k=>k.k!=='tap'&&k.e===e)||(Array.isArray(r.fx)?r.fx:[]).some(x=>x&&x.k==='act'&&x.e===e);
    function bhEnts(o){
      const U=bhSet(o),L=[];
      RULS().forEach(r=>{
        if(!rOn(r).some(id=>U.has(id)))return;
        const E2=rCs(r).filter(k=>k.k!=='tap').map(k=>k.e).concat((Array.isArray(r.fx)?r.fx:[]).filter(x=>x&&x.k==='act').map(x=>x.e));
        E2.filter((e,i)=>e&&E2.indexOf(e)===i).forEach(e=>{const q=L.find(p=>p[0]===e);if(q)q[1]++;else L.push([e,1]);});
      });
      return L;
    }
    function bhRepl(U,e,ne){
      const M=[];
      RULS().slice().forEach(r=>{
        const T=rOn(r),inU=T.filter(id=>U.has(id));
        if(!inU.length||!bhUses(r,e))return;
        if(inU.length===T.length){M.push(r);return;}
        const q=clone(r);q.id=newId('r',RULS());q.on=inU;delete q.n;
        r.on=T.filter(id=>!U.has(id));
        S.rules.splice(RULS().indexOf(r),0,q);M.push(q);
      });
      const K=[];
      M.forEach(r=>rCs(r).forEach(k=>{if(k.k!=='tap'&&k.e===e&&K.indexOf(k)<0)K.push(k);}));
      K.forEach(k=>{
        if(cUsers(k).every(r=>M.indexOf(r)>=0)){k.e=ne;return;}
        const same=c=>c.k===k.k&&c.e===ne&&(c.a||'')===(k.a||'')&&(k.k!=='cond'||c.op===k.op&&String(c.v)===String(k.v)&&String(c.v2)===String(k.v2));
        let q=CAUS().find(same);
        if(!q){q=clone(k);q.id=newId('c',CAUS());q.e=ne;delete q.n;S.causes.push(q);}
        M.forEach(r=>{const i=Array.isArray(r.c)?r.c.indexOf(k.id):-1;if(i>=0)r.c[i]=q.id;});
      });
      M.forEach(r=>(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{if(x&&x.k==='act'&&x.e===e)x.e=ne;}));
      return M.length;
    }
    function bhInput(t,commit){
      if(!commit&&!PK.setting)return;
      const o=bhTarget(),e=t.dataset.bhe,ne=t.value.trim(),h=self._hass;
      if(!o||!e||ne===e)return;
      const U=bhSet(o);
      if(!RULS().some(r=>rOn(r).some(id=>U.has(id))&&bhUses(r,e)))return;
      if(!ENT_OK.test(ne)||!PK.setting&&!(h&&h.states&&h.states[ne])){t.value=e;stamp('no entity '+(ne||'chosen'),true);return;}
      settle();const n=bhRepl(U,e,ne);
      render();store(true);flush();stamp(e+' → '+ne+' · '+n+(n===1?' rule':' rules'));
    }
    function tapGuess(T,any){
      const E2=[];
      T.map(tgtOf).filter(Boolean).forEach(o=>rulesOn(o).forEach(r=>rCs(r).forEach(k=>{if(k.e&&ENT_OK.test(k.e)&&E2.indexOf(k.e)<0)E2.push(k.e);})));
      const dom=entDom;
      return E2.find(e=>TAP_DOM.indexOf(dom(e))>=0)||E2.find(e=>TAP_DOM2.indexOf(dom(e))>=0)||(any&&E2[0])||'';
    }
    function pgLink(o,pg){
      settle();
      let r=RULS().find(q=>rKind(q)==='tap'&&rGest(q)==='tap'&&rOn(q).indexOf(o.id)>=0)||null,x=r&&fxOf(r,'act');
      if(x&&actA(x)&&actA(x)!=='page'&&!confirm('Replace the tap action “'+fxLabel(x)+'” of '+(o.n||o.id)+'?'))return;
      if(!r){
        let k=tapCause();
        if(!k){if(!Array.isArray(S.causes))S.causes=[];k={id:newId('c',S.causes),k:'tap'};S.causes.push(k);}
        r=newRule([o.id]);r.c=[k.id];r.fx=[];
      }
      x=fxOf(r,'act');if(!x){x={k:'act'};r.fx.push(x);}
      if(actA(x)!=='page'){Object.keys(x).forEach(q=>{if(q!=='k')delete x[q];});x.a='page';x.pg=pg;}
      else x.pg=pg;
      render();store(true);flush();stamp('tap → '+pgName(pgOf(pg)));
    }
    function ruleNew(T){
      if(!T||!T.length)return;
      const r=drNew(T);if(r)ruOpen(r.id);
    }
    let lvFor=null,lvE='';
    const lvRule=s=>RULS().find(r=>rKind(r)==='data'&&rFol(r)&&rFol(r).p==='text'&&rObjs(r).indexOf(s)>=0)||null;
    function lvPanel(){
      const n=E.insp.querySelector('#lvx'),s=sel>=0&&S.objects[sel];
      if(!n||!s||s.t!=='label')return;
      const r=lvRule(s),on=!!r||lvFor===s.id,k=r&&rCs(r)[0],via=!!r&&rOn(r).indexOf(s.id)<0;
      const key=JSON.stringify([on,!!r,k&&k.id,k?evAttrOpts(k):'']);
      if(n._k!==key){
        n._k=key;
        let h='<div class="f col">show<div class="seg wide" id="lvm" role="group" aria-label="The label shows">'+
          '<button type="button" data-lv="0" aria-pressed="'+!on+'">text</button>'+
          '<button type="button" data-lv="1" aria-pressed="'+on+'">value of an entity</button></div></div>';
        if(!on)h+='<label class="f col" id="ltx">text<input class="num" data-k="txt" type="text"></label>';
        else{
          h+='<label class="f col">entity<input class="num" data-lve="e" type="text"'+pickAttrs('ents','sensor.kitchen_temperature')+' aria-label="Entity"></label>';
          if(r)h+='<label class="f col">attribute<select class="num" data-lve="a" aria-label="Attribute">'+evAttrOpts(k)+'</select></label>'+
            '<label class="f">decimals<input class="num" data-lve="dec" type="number" min="0" max="6" step="1" style="width:60px" placeholder="as is"></label>'+
            '<label class="f col">prefix<input class="num" data-lve="pre" type="text" autocomplete="off"></label>'+
            '<label class="f col">suffix<input class="num" data-lve="suf" type="text" autocomplete="off" placeholder=" °C"></label>';
          h+='<p class="hint" data-lvh style="margin:-2px 0 6px"></p>';
          if(r)h+='<div class="row" style="margin-bottom:8px"><button class="btn" type="button" data-ru="" data-lvr>Open rule</button></div>';
        }
        n.innerHTML=h;
      }
      const x=r&&rFol(r),setv=(q,v)=>{const i=n.querySelector(q);if(i&&i!==root.activeElement&&i.value!==v)i.value=v;};
      setv('[data-k="txt"]',freeTxt(s));
      setv('[data-lve="e"]',k?k.e||'':lvE);
      if(r){
        setv('[data-lve="a"]',k.a||'');
        ['dec','pre','suf'].forEach(w=>setv('[data-lve="'+w+'"]',x[w]==null?'':String(x[w])));
      }
      const tb=n.querySelector('[data-lv="0"]');
      if(tb&&tb.disabled!==via){tb.disabled=via;if(via)tb.title='The value comes from a rule on a group';else tb.removeAttribute('title');}
      const ob=n.querySelector('[data-lvr]');if(ob&&r&&ob.dataset.ru!==r.id)ob.dataset.ru=r.id;
      const hn=n.querySelector('[data-lvh]');
      if(hn){
        let t;
        if(!r)t='Choose the entity: the label shows its value, also here while editing.';
        else{
          const st=k.e&&simStates(true)[k.e],v=st?fxRun(followJS(k,x),st):null;
          t=!k.e?'Choose the entity':!st?'No entity with this id':'Now: '+(v==null?'—':String(v));
          if(via){const G=grpOf(rOn(r).find(id=>chainOf(s).indexOf(id)>=0));t+=' · from a rule on group '+(G&&G.n||'')+' · changes here apply to this label only';}
          else if(rOn(r).length>1)t+=' · shared with '+(rOn(r).length-1)+(rOn(r).length===2?' other target':' other targets')+' · changes here apply to this label only';
        }
        if(hn.textContent!==t)hn.textContent=t;
      }
    }
    function lvMake(s,e){
      const k=CAUS().find(q=>q.k==='data'&&q.e===e&&!q.a)||newCause('data',e);
      const r=newRule([s.id]);r.c=[k.id];r.fx=[Object.assign({k:'follow',p:'text'},lvProp(e))];
      return r;
    }
    function lvOwn(s,r){
      const T=rOn(r);
      if(T.length===1&&T[0]===s.id)return r;
      const q=clone(r);q.id=newId('r',RULS());q.on=[s.id];delete q.n;
      r.on=T.filter(id=>id!==s.id);
      S.rules.splice(RULS().indexOf(r),0,q);
      return q;
    }
    function lvCause(r,e,a){
      const k=rCs(r)[0],x=rFol(r),old=lvProp(k.e,k.a),nw=lvProp(e,a);
      if(cUsers(k).length===1){k.e=e;if(a)k.a=a;else delete k.a;}
      else{
        const q=CAUS().find(c=>c.k==='data'&&c.e===e&&(c.a||'')===(a||''))||newCause('data',e);
        if(a)q.a=a;r.c=[q.id];
      }
      if(x.suf===old.suf&&x.dec===old.dec)['suf','dec'].forEach(w=>{if(nw[w]!=null)x[w]=nw[w];else delete x[w];});
    }
    function lvInput(t,commit){
      const s=sel>=0&&S.objects[sel];if(!s||s.t!=='label')return;
      const w=t.dataset.lve,r=lvRule(s);
      if(w==='e'){
        if(!commit&&!PK.setting){if(!r)lvE=t.value;return;}
        const e=t.value.trim(),h=self._hass,ok=ENT_OK.test(e)&&(PK.setting||!!(h&&h.states&&h.states[e]));
        if(!r){
          lvE=t.value;if(!ok)return;
          settle();lvMake(s,e);lvFor=null;lvE='';render();store(true);return;
        }
        const k=rCs(r)[0];if(!ok||k.e===e)return;
        const st=h&&h.states&&h.states[e];
        settle();lvCause(lvOwn(s,r),e,k.a&&st&&(k.a in (st.attributes||{}))?k.a:'');render();store(true);return;
      }
      if(!r)return;
      if(w==='a'){settle();lvCause(lvOwn(s,r),rCs(r)[0].e,t.value);render();store(true);return;}
      const x=rFol(lvOwn(s,r));
      if(w==='dec'){const d=Math.round(parseFloat(t.value));if(t.value===''||!(d>=0))delete x.dec;else x.dec=Math.min(6,d);}
      else if(t.value)x[w]=t.value;else delete x[w];
      render();store();
    }
    function lvClear(s){
      const R=RULS().filter(r=>rKind(r)==='data'&&rFol(r)&&rFol(r).p==='text'&&rOn(r).indexOf(s.id)>=0);
      const K=[];
      R.forEach(r=>{rCs(r).forEach(k=>{if(K.indexOf(k)<0)K.push(k);});r.on=r.on.filter(id=>id!==s.id);});
      S.rules=RULS().filter(r=>R.indexOf(r)<0||r.on.length);
      S.causes=CAUS().filter(k=>K.indexOf(k)<0||cUsers(k).length);
    }
    function inspectGrp(box){
      const G=grpOf(selGrp),m=members(selGrp);
      box.innerHTML=itabs('<label class="f col">name<input class="num" id="gname" type="text" autocomplete="off" value="'+esc(G.n||'')+'"></label>'+
          '<p class="hint" id="gcount" style="margin:-3px 0 10px">'+esc(grpCount(selGrp))+' · id '+esc(G.id)+'</p>'+posFlds()+
          '<div class="row"><button class="btn" data-z="gdel" title="Ctrl+Shift+G">Ungroup</button></div>',bhBox(),lookBox(m));
    }
    function grpRefresh(){
      if(selGrp==null)return;
      const G=grpOf(selGrp);if(!G)return;
      const q=k=>E.insp.querySelector(k);
      let n=q('#gname');if(n&&n!==root.activeElement&&n.value!==(G.n||''))n.value=G.n||'';
      n=q('#gcount');if(n){const t=grpCount(selGrp)+' · id '+G.id;if(n.textContent!==t)n.textContent=t;}
    }
    function styRefresh(){
      const n=E.insp.querySelector('#lkb');if(!n)return;
      const h=lookHTML(lookList());
      if(n._h!==h){n._h=h;n.innerHTML=h;}
    }
    function inspector(){
      const box=E.insp;
      if(selGrp!=null&&grpOf(selGrp))return inspectGrp(box);
      if(ms.length>1){
        box.innerHTML=itabs('<p class="hint" style="margin:-3px 0 10px">'+countText(ms)+'</p>'+posFlds()+
            '<div class="row"><button class="btn" data-z="grp" title="Ctrl+G">Group</button>'+
            '<button class="btn" data-z="none">Deselect</button></div>',bhBox(),lookBox(ms));
        return;
      }
      if(sel<0||!S.objects[sel]){box.innerHTML='<p class="hint">No selection</p>';return;}
      const s=S.objects[sel];
      if(isEl(s))return inspectEl(s,box);
      if(isCard(s))return inspectCard(s,box);
      const tn=s.tens||0;
      const rw='<div id="rw"'+((s.p?crOn(s.p,tn):tn>0)?' style="display:none"':'')+'>'+fld('corner rounding','r')+'</div>';
      let h=nameFld(s);
      const look=(s.t==='line'?'':phBox(s))+lookBox([s]);
      if(s.t==='reg'){
        h+=fld('center x','cx')+fld('center y','cy')+fld('radius','rr')+fld('sides','sides')+fld('rotation','rot',.5)+
           '<label class="f">curvature<input class="num" data-k="tens" type="range" min="0" max="1" step="0.05" value="'+tn+'"></label>'+rw+
           '<div class="row" style="margin-top:4px"><button class="btn" data-z="free">Convert to freehand polygon</button></div>';
      }
      else if(s.t==='poly'){
        h+=posFlds()+'<label class="f">curvature<input class="num" data-k="tens" type="range" min="0" max="1" step="0.05" value="'+tn+'"></label>'+rw+'<div id="vsr"></div>';
      }
      else if(s.t==='line')h+=posFlds()+'<label class="f">curvature<input class="num" data-k="tens" type="range" min="0" max="1" step="0.05" value="'+tn+'"></label><div id="vsr"></div>'+lnFlds(s);
      if(s.t==='rect')h+=fld('x','x')+fld('y','y')+fld('width','w')+fld('height','h')+fld('corner radius','r');
      if(s.t==='callout'){
        const opt=(k,l)=>'<option value="'+k+'"'+(k===l?' selected':'')+'>';
        const ta=CTAIL[s.tail]?s.tail:'wedge',g=coInfo(s),hid=on=>on?'':' style="display:none"';
        const ln=s.body==='line',lv=ln&&s.lo==='v';
        h+='<div class="fg"><label class="f">body<select class="num" data-k="body">'+opt('rect',s.body==='ellipse'||ln?'':'rect')+'rectangle</option>'+
             opt('ellipse',s.body)+'ellipse</option>'+opt('line',s.body)+'line</option></select></label>'+
           '<label class="f" id="clo"'+hid(ln)+'>orientation<select class="num" data-k="lo">'+opt('h',lv?'':'h')+'horizontal</option>'+
             opt('v',lv?'v':'')+'vertical</option></select></label>'+
           '<label class="f">tail<select class="num" data-k="tail">'+opt('wedge',ta)+'wedge</option>'+opt('curved',ta)+'curved</option>'+
             opt('line',ta)+'leader line</option>'+opt('bubbles',ta)+'thought bubbles</option></select></label></div>'+
           fld('x','x')+fld('y','y')+'<div id="cwf"'+hid(!lv)+'>'+fld('width','w')+'</div>'+'<div id="chf"'+hid(!ln||lv)+'>'+fld('height','h')+'</div>'+
           '<div id="ccr"'+hid(!g.ell&&!ln)+'>'+fld('corner radius','r')+'</div>'+
           fld('tip x','px')+fld('tip y','py')+
           '<div id="ctw"'+hid(ta!=='line')+'>'+fld(ta==='bubbles'?'bubble size':'tail width','tw')+'</div>'+
           '<div id="clw"'+hid(ta==='line'||ln)+'>'+fld('line width','lw',.5)+'</div>'+
           '<div id="cdt"'+hid(ta==='line')+'><label class="f">dot size<input class="num" data-k="dot" type="number" min="0" max="200" step="1" placeholder="auto '+f(coDotAuto(s)*2)+'" value="'+(typeof s.dot==='number'?f(s.dot):'')+'"></label></div>'+
           '<label class="f">tail position<input class="num" data-k="tb" type="range" min="0" max="1" step="0.01" value="'+(s.tb==null?.5:s.tb)+'"></label>'+
           '<label class="f" id="cbd"'+hid(ta==='curved')+'>bend<input class="num" data-k="bend" type="range" min="-0.5" max="0.5" step="0.01" value="'+(s.bend||0)+'"></label>'+
           '<p class="hint" id="cth" style="margin:-2px 0 8px'+(g.inside?'':';display:none')+'">'+(g.inside?CO_IN:'')+'</p>';
      }
      if(s.t==='circle')h+=fld('center x','cx')+fld('center y','cy')+fld('radius','rr');
      if(s.t==='ring')h+=fld('center x','cx')+fld('center y','cy')+fld('inner radius','r1')+fld('outer radius','r2')+fld('start angle','a0')+fld('end angle','a1')+
        '<div class="row" style="margin-top:4px"><input class="num" id="rn" type="number" value="4" style="width:56px" title="Sectors" aria-label="Sectors"><input class="num" id="rg" type="number" value="10" style="width:56px" title="Gap (°)" aria-label="Gap (°)"><button class="btn" id="rep">Repeat around circle</button></div>';

      if(IMSZ[s.t])h+='<div class="row" id="iszr" style="margin:2px 0 8px;display:none"><select class="num" id="iszs" aria-label="Image to take the size from"></select>'+
        '<button class="btn" type="button" id="isz" data-z="isize">Zone to image size</button></div>';
      box.innerHTML=itabs(h,bhBox(),look);
    }
    const LN_OPT=[['','cut'],['r','round'],['a','arrow'],['v','open arrow'],['c','circle'],['q','square'],['d','diamond'],['b','bar']];
    function lnFlds(s){
      const eo=j=>{const v=lnEnd(s,j);return '<div class="f">'+(j?'end':'start')+'<span style="display:flex;align-items:center;gap:8px;white-space:nowrap">'+
        '<label class="chk" id="lh'+j+'" style="margin:0'+(LN_HOL[v]?'':';display:none')+'"><input type="checkbox" data-k="h'+j+'"'+(lnHol(s,j)?' checked':'')+'> hollow</label>'+
        '<select class="num" data-k="e'+j+'" style="width:auto">'+LN_OPT.map(q=>'<option value="'+q[0]+'"'+(q[0]===v?' selected':'')+'>'+q[1]+'</option>').join('')+'</select></span></div>';};
      const nf=(l,k,ph,a,u)=>'<label class="f">'+l+'<span><input class="num" data-k="'+k+'" type="number" '+a+' style="width:64px" placeholder="'+ph+'" value="'+(lnNum(s[k])==null?'':f(+s[k]))+'">'+(u?' '+u:'')+'</span></label>';
      return eo(0)+eo(1)+nf('end size','es','4','min="1" max="20" step="0.5"','× width')+
        nf('flow','fv','0','step="5"','px/s')+nf('dots','dd','—','min="0" max="20" step="0.5"','× width')+nf('dot spacing','dg','40','min="2" step="1"','px')+
        nf('gauge','gp','—','min="0" max="100" step="1"','%');
    }
    const LN_K=/^(e0|e1|h0|h1|es|fv|dd|dg|gp)$/;
    function lnSet(s,k,t){
      if(k==='e0'||k==='e1'){if(t.value)s[k]=t.value;else delete s[k];}
      else if(k==='h0'||k==='h1'){if(t.checked)s[k]=true;else delete s[k];}
      else{const raw=t.value.trim();if(!raw)delete s[k];else{const v=parseFloat(raw);if(!isFinite(v))return false;s[k]=v;}}
      lnFix(s);return true;
    }
    function phBox(s){
      const A=phAll(s),ci=phOpen(s);
      let h='';
      A.forEach((q,i)=>{
        const on=i===ci;
        h+='<div class="phb'+(on?' on':'')+'"><div class="slr phr" data-phi="'+i+'"><button type="button" class="phn" data-pho="'+i+'" aria-expanded="'+on+'">'+
          '<span class="car" aria-hidden="true">'+(on?'▾':'▸')+'</span><span class="phl"><b>'+esc(phName(s,q))+'</b><small>'+esc(q.p?q.p.split('/').pop():'no file')+'</small></span></button>'+
          '<button type="button" class="evb" data-pha="up"'+(i?'':' disabled')+' title="Move up" aria-label="Move up">↑</button>'+
          '<button type="button" class="evb" data-pha="down"'+(i<A.length-1?'':' disabled')+' title="Move down" aria-label="Move down">↓</button>'+
          '<button type="button" class="evb" data-pha="del" title="Remove photo" aria-label="Remove photo">✕</button></div>'+
          (on?phOpts(s,q,i):'')+'</div>';
      });
      return tbx('Photos',h+'<div class="row" style="margin:4px 0 0"><button class="btn add" type="button" data-pha="add">+ photo</button></div>',' id="phx"');
    }
    function phOpts(s,q,i){
      const V=phView(s,q),I=IM(V),ip=I.p||'',w=phWarn(ip);
      return '<div class="pho">'+
         '<label class="f col">photo name<input class="num" data-phn="1" type="text" autocomplete="off" placeholder="'+esc('Photo '+(i+1))+'" value="'+esc(typeof I.n==='string'?I.n:'')+'"></label>'+
         '<label class="f col" style="margin-bottom:0">path</label>'+
         '<div class="prow"><input class="num" data-ki="p" type="text" placeholder="immagini/kitchen_on.jpg" aria-label="Photo path" value="'+esc(ip)+'">'+
         '<button class="btn" type="button" data-browse="stati">Browse…</button></div>'+
         '<p class="hint" id="ih" style="margin-top:0"'+(w?'':' hidden')+'>'+esc(w)+'</p>'+
         '<div id="iw"'+(ip?'':' style="display:none"')+'>'+
           '<div class="f col">photo position<div class="seg wide" id="imd" role="group" aria-label="Photo position">'+
             '<button type="button" data-im="0" aria-pressed="'+!I.follow+'">anchored to canvas</button>'+
             '<button type="button" data-im="1" aria-pressed="'+!!I.follow+'">follows shape</button></div></div>'+
           '<div id="ifo">'+
             '<label class="f col">fit<select class="num" data-ib="fit" data-mode="'+(I.follow?1:0)+'">'+fitOpts(V)+'</select></label>'+
             ibFld('scale','z',5,'min="1"')+ibFld('width','w',1,'min="1"')+ibFld('height','h',1,'min="1"')+ibFld('offset x','x',1)+ibFld('offset y','y',1)+
             '<div class="row" style="margin:2px 0 4px"><button class="btn" type="button" id="ifb" data-z="ifit">'+fitLabel(V)+'</button></div>'+
           '</div>'+
         '</div></div>';
    }
    function nameFld(s){
      return '<label class="f col">name<input class="num" data-k="n" type="text" autocomplete="off" value="'+esc(s.n||'')+'"></label>'+
        '<p class="hint" id="idh" style="margin:-3px 0 8px">'+esc(idText(s))+'</p>';
    }
    function inspectEl(s,box){
      let h=nameFld(s)+fld('x','x')+fld('y','y');
      if(s.t==='label'){
        h+='<div id="lvx"></div>'+
           '<label class="f"><span id="lszl">'+(lblTx(s).fs?'font size (px) · style':'font size (px)')+'</span><input class="num" data-k="size" type="text" inputmode="numeric" style="width:60px"'+
             (lblTx(s).fs?' disabled value="'+f(lblTx(s).fs)+'"':' value="'+(s.size||18)+'"')+'></label>';
      }else{
        h+='<label class="f col">icon<input class="num" data-k="icon" type="text" placeholder="mdi:thermometer" value="'+esc(s.icon||'')+'"></label>'+
           '<label class="f">size<input class="num" data-k="size" type="number" min="8" step="2" style="width:60px" value="'+(s.size||28)+'"></label>'+
           '<p class="hint" id="ich">'+esc(iconHint(s))+'</p>';
      }
      const look=lookBox([s]);
      box.innerHTML=itabs(h,bhBox(),look);
    }
    const cdCfg=s=>isCard(s)&&isObj(s.cfg)&&typeof s.cfg.type==='string'&&s.cfg.type&&!(spOut&&cdSp(s))?s.cfg:null;
    const cdSp=s=>SP_IN.test(JSON.stringify(s.cfg));
    function cdSnap(v){
      if(Array.isArray(v))return v.map(cdSnap);
      if(!isObj(v))return v;
      const o={};Object.keys(v).forEach(k=>{o[k]=k==='camera_view'&&v[k]==='live'?'auto':cdSnap(v[k]);});
      return o;
    }
    const cdKey=c=>isObj(c)?String(c.type||'').replace(/^custom:/,'')+'|'+(typeof c.entity==='string'?c.entity:''):'';
    function cdFix(s){
      ['img','imx','txt','icon','size','r','rot','fl','lo','body','tail'].forEach(k=>{if(k in s)delete s[k];});
      ['x','y'].forEach(k=>{if(typeof s[k]!=='number'||!isFinite(s[k]))s[k]=0;});
      ['w','h'].forEach(k=>{if(typeof s[k]!=='number'||!(s[k]>=1))s[k]=k==='w'?320:180;});
      if('src' in s&&s.src!=='dash'&&s.src!=='ui')delete s.src;
      if('yaml' in s&&typeof s.yaml!=='string')delete s.yaml;
      if('cfg' in s&&!cdCfg(s))delete s.cfg;
      if('ref' in s){
        const r=s.ref;
        if(!isObj(r)||typeof r.p!=='string'||!(typeof r.v==='string'||Number.isInteger(r.v)))delete s.ref;
        else{if(typeof r.d!=='string')r.d='';if('k' in r&&typeof r.k!=='string')delete r.k;}
      }
    }
    const CD={dash:null,conf:new Map(),msg:new Map(),pick:null,fp:null};
    const CD_LOST='not found in the dashboard: last copy kept';
    function cdHint(id){
      const n=E.insp.querySelector('#cdh');if(!n||!inspObj||inspObj.id!==id)return;
      const t=CD.msg.get(id)||'';if(n.textContent!==t)n.textContent=t;n.hidden=!t;
    }
    async function cdDashes(){
      if(CD.dash)return CD.dash;
      let L=[];
      try{L=await self._hass.callWS({type:'lovelace/dashboards/list'});}catch(_){}
      const D=[{d:'',n:'Overview'}];
      (Array.isArray(L)?L:[]).forEach(x=>{
        if(!x||typeof x.url_path!=='string')return;
        if(x.url_path==='lovelace'){D[0].n=x.title||D[0].n;return;}
        D.push({d:x.url_path,n:x.title||x.url_path});
      });
      CD.dash=D;return D;
    }
    async function cdConf(d){
      if(CD.conf.has(d))return CD.conf.get(d);
      const c=await self._hass.callWS({type:'lovelace/config',url_path:d||null});
      CD.conf.set(d,c);return c;
    }
    const cdViews=conf=>isObj(conf)&&Array.isArray(conf.views)?conf.views:[];
    const cdViewOf=(conf,v)=>{const V=cdViews(conf);return typeof v==='string'?V.find(x=>isObj(x)&&x.path===v)||null:isObj(V[v])?V[v]:null;};
    function cdList(V){
      const out=[];
      const walk=(arr,base,dep)=>{(Array.isArray(arr)?arr:[]).forEach((c,i)=>{
        if(!isObj(c))return;const p=base+'.'+i;out.push({p:p,c:c,dep:dep});
        if(Array.isArray(c.cards))walk(c.cards,p+'.cards',dep+1);
        else if(isObj(c.card)){out.push({p:p+'.card',c:c.card,dep:dep+1});if(Array.isArray(c.card.cards))walk(c.card.cards,p+'.card.cards',dep+2);}
      });};
      walk(V.cards,'cards',0);
      (Array.isArray(V.sections)?V.sections:[]).forEach((x,j)=>{if(isObj(x))walk(x.cards,'sections.'+j+'.cards',0);});
      return out;
    }
    const cdAt=(V,p)=>String(p).split('.').reduce((o,k)=>o==null?null:o[/^\d+$/.test(k)?+k:k],V);
    function cdFind(conf,ref){
      const V=cdViewOf(conf,ref.v);if(!V)return null;
      const c=cdAt(V,ref.p);
      if(isObj(c)&&typeof c.type==='string'&&(!ref.k||cdKey(c)===ref.k))return {p:ref.p,c:c};
      if(ref.k){const M=cdList(V).filter(q=>cdKey(q.c)===ref.k);if(M.length===1)return M[0];}
      return null;
    }
    function cdName(c){
      const h=self._hass,st=h&&h.states&&typeof c.entity==='string'?h.states[c.entity]:null;
      const d=st&&st.attributes&&st.attributes.friendly_name||c.entity||c.name||c.title||c.heading||'';
      return String(c.type||'?').replace(/^custom:/,'')+(d?' · '+d:'');
    }
    async function cdRefresh(){
      const L=S.objects.filter(s=>isCard(s)&&s.src==='dash'&&isObj(s.ref));
      if(!L.length)return [];
      CD.conf.clear();
      const bad=[];
      for(const s of L){
        let conf=null;
        try{conf=await cdConf(s.ref.d);}catch(_){}
        const r=conf&&cdFind(conf,s.ref);
        if(!r){bad.push(s.n||s.id);CD.msg.set(s.id,CD_LOST);continue;}
        CD.msg.delete(s.id);
        if(r.p!==s.ref.p)s.ref.p=r.p;
        if(JSON.stringify(r.c)!==JSON.stringify(s.cfg))s.cfg=clone(r.c);
      }
      return bad;
    }
    async function cdFpOk(){
      if(CD.fp!=null)return CD.fp;
      let ok=true;
      try{
        const R=await self._hass.callWS({type:'lovelace/resources'});
        const r=(Array.isArray(R)?R:[]).find(x=>x&&/floorplan/i.test(String(x.url||'')));
        if(r){const t=await (await fetch(r.url,{cache:'no-cache'})).text();ok=t.indexOf('card_set')>=0;}
      }catch(_){}
      CD.fp=ok;return ok;
    }
    let cdResP=null;
    function cdRes(){
      if(cdResP)return cdResP;
      cdResP=(async()=>{
        let R=[];
        try{R=await self._hass.callWS({type:'lovelace/resources'});}catch(_){}
        (Array.isArray(R)?R:[]).forEach(r=>{try{
          const u=r&&typeof r.url==='string'?r.url:'';if(!u)return;
          const q=fnEsc(u);
          if(r.type==='css'){
            if(!document.querySelector('link[href="'+q+'"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=u;document.head.appendChild(l);}
            return;
          }
          if(document.querySelector('script[src="'+q+'"]'))return;
          const sc=document.createElement('script');if(r.type!=='js')sc.type='module';sc.src=u;document.head.appendChild(sc);
        }catch(_){}});
        try{return typeof window.loadCardHelpers==='function'?await window.loadCardHelpers():null;}catch(_){return null;}
      })();
      return cdResP;
    }

    const cdN=new Map();
    const WK=(()=>{try{return CSS.supports('hanging-punctuation','first');}catch(_){return false;}})();
    if(WK)zkCtm(window);
    function cdMake(o,cfg){
      const key=o.key;
      if(!cfg){o.el=null;o.sb.replaceChildren();return;}
      cdRes().then(H=>{
        if(o.key!==key)return;
        let el;
        try{el=H?H.createCardElement(clone(cfg)):null;}catch(_){el=null;}
        if(!el){el=document.createElement('div');el.className='cdx';el.textContent=cfg.type;}
        el.hass=self._hass;
        el.addEventListener('ll-rebuild',ev=>{ev.stopPropagation();if(o.key===key){o.key='';req();}});
        o.el=el;o.sb.replaceChildren(el);
      }).catch(()=>{});
    }
    function cdDraw(){
      const G=E.cards,L=flow&&!flCv?[]:S.objects.filter(s=>isCard(s)&&onPg(s)&&cdCfg(s));
      const keep=new Set();
      let T=null;
      if(WK&&L.length){const m=cv.getScreenCTM(),r=cv.getBoundingClientRect();if(m)T={k:m.a,x:m.e-r.left,y:m.f-r.top};}
      L.forEach((s,i)=>{
        keep.add(s.id);
        let o=cdN.get(s.id);
        if(!o){
          const fo=document.createElementNS(SVGNS,'foreignObject'),box=document.createElement('div'),sb=document.createElement('div');
          box.className='cdb';sb.className='cds';box.appendChild(sb);fo.appendChild(box);
          o={fo:fo,box:box,sb:sb,el:null,key:'',tr:'',og:'',cl:'',sig:'',sk:[]};cdN.set(s.id,o);
        }
        if(G.children[i]!==o.fo)G.insertBefore(o.fo,G.children[i]||null);
        const cl=cdCls(s);if(o.cl!==cl){o.cl=cl;o.fo.setAttribute('class',cl);}
        const hd=vHid(s)?'none':'';if(o.fo.style.display!==hd)o.fo.style.display=hd;
        cdLook(o,s);
        const ra={x:f(s.x),y:f(s.y),width:f(Math.max(1,s.w)),height:f(Math.max(1,s.h))};
        for(const a in ra){const v=String(ra[a]);if(o.fo.getAttribute(a)!==v)o.fo.setAttribute(a,v);}
        const tr=T?'translate('+T.x+'px, '+T.y+'px) scale('+T.k+')':'',og=T?f(-s.x)+'px '+f(-s.y)+'px':'';
        if(o.tr!==tr){o.tr=tr;o.box.style.transform=tr;}
        if(o.og!==og){o.og=og;o.box.style.transformOrigin=og;}
        const c=cdCfg(s),cfg=pvl()?c:cdSnap(c),key=JSON.stringify(cfg);
        if(key!==o.key){o.key=key;cdMake(o,cfg);}
      });
      cdN.forEach((o,id)=>{if(!keep.has(id)){o.fo.remove();cdN.delete(id);}});
    }
    function cdHass(h){cdN.forEach(o=>{if(o.el)o.el.hass=h;});ceHass(h);}
    const HIT_MV=['animation','transition','transform-box','transform-origin','translate','rotate','scale'];
    function hitMv(h,M,box){
      if(!h)return;
      let D={};if(pvl()){HIT_MV.forEach(k=>{if(k in M)D[k]=M[k];});if(box&&Object.keys(D).length)D=Object.assign({},box,D);}
      const sig=Object.keys(D).map(k=>k+':'+D[k]).join(';');if((h.getAttribute('data-hv')||'')===sig)return;
      h.setAttribute('data-hv',sig);(h._hvk||[]).forEach(k=>h.style.removeProperty(k));
      Object.keys(D).forEach(k=>h.style.setProperty(k,D[k]));h._hvk=Object.keys(D);
    }
    function cdLook(o,s){
      const M={},ed=!pvl(),ids=stIds();
      let rm=false;if(!ed)try{rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
      const put=(x,D)=>cdDecl(x,ed).forEach(d=>{const j=d.indexOf(':');D[d.slice(0,j)]=d.slice(j+1).trim();});
      evLayers(s).forEach(x=>{
        put(x,M);
        if(!ed&&stHas(x,'a')&&anOf(x,stState(x,'n')||Object.assign({},ST_P),'c')){const A=rm?null:cdAn(x);M.animation=A?'ed-anim-'+ids.get(x.id)+'-c '+A.sh:'none';}
      });
      const gr=!ed&&ruleOf(tapMv.get(s.id)),gv=gr&&actMo(gr);
      if(moGo(gv))mvMos(gv).forEach(st=>{
        const Mo=moOf(st),t=amVal(s.id,st)*100,has=p=>Mo.pp.indexOf(p)>=0;
        if(has('op'))M.opacity=moVal(Mo,'op',t);
        if(has('mx')||has('my'))M.translate=(has('mx')?moVal(Mo,'mx',t):'0px')+' '+(has('my')?moVal(Mo,'my',t):'0px');
        if(has('mr'))M.rotate=moVal(Mo,'mr',t);
        if(has('ms'))M.scale=moSc(moVal(Mo,'ms',t),st.ay);
        M['transform-origin']=pivKw(moPv(st)||'c');
      });
      if(soConf(stysOf(s))){const B={};stysOf(s).forEach(x=>put(x,B));Object.keys(B).forEach(k=>{if(!(k in M))M[k]=B[k];});}
      const sig=Object.keys(M).map(k=>k+':'+M[k]).join(';');
      hitMv(gShapes.querySelector('[data-i="'+S.objects.indexOf(s)+'"]'),M,{'transform-box':'fill-box','transform-origin':'center'});
      if(o.sig===sig)return;
      o.sig=sig;o.sk.forEach(k=>o.sb.style.removeProperty(k));
      Object.keys(M).forEach(k=>o.sb.style.setProperty(k,M[k]));o.sk=Object.keys(M);
    }

    function inspectCard(s,box){
      const dash=s.src==='dash',src=dash?'dash':s.src==='ui'?'ui':'yaml',c=cdCfg(s);
      const sb=(k,l)=>'<button type="button" data-cds="'+k+'" aria-pressed="'+(src===k)+'">'+l+'</button>';
      let h=nameFld(s)+fld('x','x')+fld('y','y')+fld('width','w')+fld('height','h')+
        '<div class="f col">source<div class="seg wide" role="group" aria-label="Card source">'+
          sb('ui','Visual')+sb('yaml','YAML')+sb('dash','Dashboard')+'</div></div>';
      if(src==='ui')h+='<button class="btn cdv" type="button" data-cde="1">'+esc(c?cdName(c):'Choose card…')+'</button>';
      else if(!dash)h+='<textarea class="num cdy" data-cdy="1" rows="9" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Card YAML" placeholder="type: picture-entity&#10;entity: camera.garden">'+esc(s.yaml||'')+'</textarea>';
      else h+='<label class="f col">dashboard<select class="num" data-cd="d" aria-label="Dashboard"></select></label>'+
        '<label class="f col">view<select class="num" data-cd="v" aria-label="View"></select></label>'+
        '<label class="f col">card<select class="num" data-cd="c" aria-label="Card"></select></label>';
      const m=CD.msg.get(s.id)||'';
      h+='<p class="hint" id="cdh"'+(m?'':' hidden')+'>'+esc(m)+'</p>';
      box.innerHTML=itabs(h,bhBox(),lookBox([s]));
      if(dash)cdFill(s.id);
    }
    async function cdFill(id){
      const s=S.objects.find(q=>q.id===id);if(!s)return;
      const ref=isObj(s.ref)?s.ref:null,P=CD.pick&&CD.pick.id===id?CD.pick:{id:id,d:ref?ref.d:null,v:ref?ref.v:null};
      const q=k=>E.insp.querySelector('[data-cd="'+k+'"]'),opt=(v,l,on)=>'<option value="'+esc(v)+'"'+(on?' selected':'')+'>'+esc(l)+'</option>';
      const D=await cdDashes();
      if(!inspObj||inspObj.id!==id||!q('d'))return;
      q('d').innerHTML=(P.d==null?opt('','…',true):'')+D.map(x=>opt('d:'+x.d,x.n,P.d===x.d)).join('');
      if(P.d==null){q('v').innerHTML='';q('c').innerHTML='';return;}
      let conf=null;
      try{
        conf=await cdConf(P.d);
        if(ref&&ref.d===P.d){if(cdFind(conf,ref))CD.msg.delete(id);else CD.msg.set(id,CD_LOST);}
        else if(/^dashboard not readable/.test(CD.msg.get(id)||''))CD.msg.delete(id);
      }catch(e){CD.msg.set(id,'dashboard not readable: '+errText(e));}
      if(!inspObj||inspObj.id!==id||!q('v'))return;
      cdHint(id);
      const V=cdViews(conf),vt=(x,i)=>isObj(x)&&(x.title||x.path)||'View '+(i+1),T=V.map(vt);
      q('v').innerHTML=(P.v==null?opt('','…',true):'')+V.map((x,i)=>{const k=isObj(x)&&typeof x.path==='string'&&x.path?'p:'+x.path:'i:'+i;
        const l=T[i]+(T.indexOf(T[i])!==T.lastIndexOf(T[i])&&isObj(x)&&x.path&&x.path!==T[i]?' · '+x.path:'');
        return opt(k,l,P.v!=null&&(typeof P.v==='string'?k==='p:'+P.v:k==='i:'+P.v));}).join('');
      const VV=P.v==null?null:cdViewOf(conf,P.v);
      if(!VV){q('c').innerHTML='';return;}
      const C=cdList(VV),sel=ref&&ref.d===P.d&&ref.v===P.v?ref.p:null;
      q('c').innerHTML=(sel==null?opt('','…',true):'')+C.map(x=>opt(x.p,'  '.repeat(x.dep)+cdName(x.c),x.p===sel)).join('');
    }
    let cdT=0;
    function cdYaml(id,text){
      const s=S.objects.find(q=>q.id===id);if(!s)return;
      s.yaml=text;store();
      clearTimeout(cdT);
      cdT=setTimeout(async()=>{
        const o=()=>S.objects.find(q=>q.id===id);
        if(!text.trim()){const x=o();if(x&&x.yaml===text&&x.cfg){delete x.cfg;render();store();}CD.msg.delete(id);cdHint(id);return;}
        try{
          const r=await self._hass.callWS({type:'ada_studio/yaml',text:text});
          const x=o();if(!x||x.yaml!==text)return;
          CD.msg.delete(id);cdHint(id);
          if(JSON.stringify(r.config)!==JSON.stringify(x.cfg)){x.cfg=r.config;render();store();}
        }catch(e){const x=o();if(!x||x.yaml!==text)return;CD.msg.set(id,errText(e));cdHint(id);}
      },500);
    }
    E.insp.addEventListener('input',e=>{
      const t=e.target;if(!t.dataset||!t.dataset.cdy)return;
      const s=sel>=0&&S.objects[sel];if(isCard(s))cdYaml(s.id,t.value);
    });
    E.insp.addEventListener('change',async e=>{
      const t=e.target,w=t.dataset&&t.dataset.cd;if(!w)return;
      const s=sel>=0&&S.objects[sel];if(!isCard(s))return;
      const id=s.id,P=CD.pick&&CD.pick.id===id?CD.pick:(CD.pick={id:id,d:isObj(s.ref)?s.ref.d:null,v:isObj(s.ref)?s.ref.v:null});
      const v=t.value;if(!v)return;
      if(w==='d'){P.d=v.slice(2);P.v=null;cdFill(id);return;}
      if(w==='v'){P.v=v[0]==='p'?v.slice(2):+v.slice(2);cdFill(id);return;}
      let conf=null;try{conf=await cdConf(P.d);}catch(_){return;}
      const V=cdViewOf(conf,P.v),c=V&&cdAt(V,v),x=S.objects.find(q=>q.id===id);
      if(!isObj(c)||typeof c.type!=='string'||!x)return;
      settle();
      x.src='dash';x.ref={d:P.d,v:P.v,p:v,k:cdKey(c)};x.cfg=clone(c);CD.msg.delete(id);CD.pick=null;
      render();store(true);
    });
    E.insp.addEventListener('click',e=>{
      const s=sel>=0&&S.objects[sel];if(!isCard(s))return;
      if(e.target.closest('[data-cde]')){ceOpen(s.id);return;}
      const b=e.target.closest('[data-cds]');if(!b)return;
      const k=b.dataset.cds,cur=s.src==='dash'||s.src==='ui'?s.src:'yaml';if(k===cur)return;
      settle();if(k==='yaml')delete s.src;else s.src=k;CD.pick=null;inspObj=null;render();store(true);
      if(k==='ui'&&!cdCfg(s))ceOpen(s.id);
    });

    const CE={el:$('#cde'),g:$('#cdeg'),t:$('#cdet'),b:$('#cdeb'),id:null,ed:null,pk:null,pv:null,pb:null,pvk:'',ro:null,seq:0,tm:0};
    const CE_LV={views:[]};
    let ceP=null;
    function ceLoad(){
      if(ceP)return ceP;
      ceP=(async()=>{
        const has=()=>!!(customElements.get('hui-card-picker')&&customElements.get('hui-card-element-editor'));
        const H=await cdRes(),to=ms=>new Promise(r=>setTimeout(r,ms));
        if(!has()&&H){
          try{H.createCardElement({type:'vertical-stack',cards:[]});}catch(_){}
          const C=await Promise.race([customElements.whenDefined('hui-vertical-stack-card').then(()=>customElements.get('hui-vertical-stack-card')),to(8000)]);
          try{if(C&&C.getConfigElement)await C.getConfigElement();}catch(_){}
          await Promise.race([Promise.all([customElements.whenDefined('hui-card-picker'),customElements.whenDefined('hui-card-element-editor')]),to(8000)]);
        }
        if(!has())ceP=null;
        return has();
      })();
      return ceP;
    }
    const ceCard=()=>{const s=CE.id&&S.objects.find(q=>q.id===CE.id);return isCard(s)?s:null;};
    async function ceOpen(id){
      const s=S.objects.find(q=>q.id===id);if(!isCard(s))return;
      pickClose();galClose();settle();
      const seq=++CE.seq;
      CE.id=id;ceClear();CE.t.textContent=s.n||'Card';CE.b.hidden=true;CE.el.hidden=false;
      CE.g.innerHTML='<p class="hint">loading…</p>';
      const ok=await ceLoad();
      if(seq!==CE.seq||CE.el.hidden)return;
      if(!ok){CE.g.innerHTML='<p class="hint">the card editor of Home Assistant is not available</p>';return;}
      if(cdCfg(s))ceEdit();else cePick();
    }
    function ceClear(){
      clearTimeout(CE.tm);if(CE.ro){CE.ro.disconnect();CE.ro=null;}
      CE.ed=CE.pk=CE.pv=CE.pb=null;CE.pvk='';CE.g.replaceChildren();
    }
    function ceClose(quiet){
      if(CE.el.hidden)return;
      CE.seq++;ceClear();CE.el.hidden=true;CE.id=null;
      if(!quiet){settle();inspObj=null;render();}
    }
    function cePick(){
      ceClear();
      const s=ceCard();if(!s)return;
      CE.t.textContent=s.n||'Card';CE.b.hidden=true;
      const p=document.createElement('hui-card-picker');
      p.hass=self._hass;p.lovelace=CE_LV;
      p.addEventListener('config-changed',e=>{e.stopPropagation();cePut(e.detail&&e.detail.config,true);});
      CE.pk=p;CE.g.appendChild(p);
    }
    function ceEdit(){
      ceClear();
      const s=ceCard(),c=s&&cdCfg(s);if(!c){cePick();return;}
      CE.t.textContent=cdName(c);CE.b.hidden=false;
      const ed=document.createElement('hui-card-element-editor');
      ed.hass=self._hass;ed.lovelace=CE_LV;ed.value=clone(c);
      ed.addEventListener('config-changed',e=>{e.stopPropagation();const d=e.detail||{};if(!d.error)cePut(d.config,false);});
      ed.addEventListener('GUImode-changed',e=>e.stopPropagation());
      const L=document.createElement('div'),P=document.createElement('div'),B=document.createElement('div');
      L.className='cdee';P.className='cdep';B.className='cdpb';L.appendChild(ed);P.appendChild(B);CE.g.append(L,P);
      CE.ed=ed;CE.pb=B;
      CE.ro=new ResizeObserver(cePvFit);CE.ro.observe(P);
      cePv();
    }
    function cePut(c,now){
      const s=ceCard();if(!s||!isObj(c))return;
      if(typeof c.type!=='string'||!c.type){
        if(!now)return;
        ceClose(true);settle();delete s.src;inspObj=null;render();store(true);
        const t=E.insp.querySelector('[data-cdy]');if(t)t.focus();
        return;
      }
      if(JSON.stringify(c)!==JSON.stringify(s.cfg)){
        if(now)settle();
        s.cfg=clone(c);s.yaml=yamlOf(s.cfg,'');CD.msg.delete(s.id);
        render();store(now);
      }
      if(now){ceEdit();return;}
      CE.t.textContent=cdName(s.cfg);
      clearTimeout(CE.tm);CE.tm=setTimeout(cePv,250);
    }
    function cePv(){
      const s=ceCard(),B=CE.pb,c=s&&cdCfg(s);if(!B||!c)return;
      const cfg=cdSnap(c),k=JSON.stringify(cfg)+'|'+s.w+'|'+s.h;if(k===CE.pvk)return;CE.pvk=k;
      B.style.width=f(Math.max(1,s.w))+'px';B.style.height=f(Math.max(1,s.h))+'px';cePvFit();
      cdRes().then(H=>{
        if(CE.pb!==B||CE.pvk!==k)return;
        let el;
        try{el=H?H.createCardElement(clone(cfg)):null;}catch(_){el=null;}
        if(!el)return;
        el.hass=self._hass;
        el.addEventListener('ll-rebuild',ev=>{ev.stopPropagation();if(CE.pb===B&&CE.pvk===k){CE.pvk='';cePv();}});
        CE.pv=el;B.replaceChildren(el);
      }).catch(()=>{});
    }
    function cePvFit(){
      const B=CE.pb,s=ceCard();if(!B||!s||!B.parentNode)return;
      const w=B.parentNode.clientWidth-24,k=w>0?Math.min(1,w/Math.max(1,s.w)):1;
      B.style.transform=k<1?'scale('+f(k)+')':'';B.style.marginBottom=k<1?f(Math.max(1,s.h)*(k-1))+'px':'';
    }
    function ceHass(h){[CE.ed,CE.pk,CE.pv].forEach(x=>{if(x)x.hass=h;});}
    CE.b.addEventListener('click',cePick);
    $('#cdex').addEventListener('click',()=>ceClose());
    $('#erdok').addEventListener('click',()=>errClose());
    CE.el.addEventListener('click',e=>{if(e.target===CE.el)ceClose();});

    const cdRules=s=>mem('cdr',s,()=>condOk().filter(r=>idsStys(rSty(r)).length&&rObjs(r).indexOf(s)>=0));
    const cdTaps=s=>mem('cdk',s,()=>tapLys().filter(q=>{const to=q.x.to||[];return [s.id].concat(chainOf(s)).some(id=>to.indexOf(id)>=0);}));
    const cdGo=s=>mem('cdg',s,()=>amGoR().filter(r=>{const to=actMo(r).to||[];return [s.id].concat(chainOf(s)).some(id=>to.indexOf(id)>=0);}));
    const cdStyled=s=>isCard(s)&&(stysOf(s).length>0||cdRules(s).length>0||cdTaps(s).length>0||cdGo(s).length>0||!!actRule(s));
    const cdCls=s=>{const c=stClass(s);return 'card'+(cdStyled(s)?' cs':'')+(c?' '+c:'');};
    function cdBg(p){
      const s=ftOf(p),a=f(50-s*50)+'%',b=f(50+s*50)+'%',c1=rgba(p.fc,p.fa),c2=rgba(p.fc2,p.fa2),g=+p.fg||0;
      if(p.f==='n')return 'transparent';
      if(p.f==='l')return 'linear-gradient('+f(g+90)+'deg, '+c1+' '+a+', '+c2+' '+b+')';
      if(p.f==='r')return 'radial-gradient(closest-side, '+c1+' '+a+', '+c2+' '+b+')';
      if(p.f==='k'){
        const u=fpU(p),h0=f(90*(1-s)),h1=f(90*(1+s));
        return 'conic-gradient(from '+f(g+90)+'deg at '+f(u.x*100)+'% '+f(u.y*100)+'%, '+c1+' '+h0+'deg, '+c2+' '+h1+'deg, '+c2+' '+f(360-h1)+'deg, '+c1+' '+f(360-h0)+'deg)';
      }
      return c1;
    }
    const CD_TR=['opacity','translate','rotate','scale'];
    function cdDecl(st,edit){
      const U=stUseOf(st),p=stState(st,'n')||Object.assign({},ST_P),d=[];
      if(U.indexOf('f')>=0)d.push('--ha-card-background: '+cdBg(p));
      if(U.indexOf('b')>=0)d.push(...(p.sw>0?['--ha-card-border-width: '+f(p.sw)+'px','--ha-card-border-color: '+rgba(p.sc,p.sa)]:['--ha-card-border-width: 0px']));
      if(U.indexOf('g')>=0)d.push('--ha-card-box-shadow: '+(p.g?f(+p.gx||0)+'px '+f(+p.gy||0)+'px '+f(Math.max(0,+p.gb||0))+'px '+rgba(p.gc,p.ga):'none'));
      if(U.indexOf('o')>=0)d.push('opacity: '+(+clamp(p.op,0,1).toFixed(2)));
      if(edit)return d;
      if(U.indexOf('x')>=0)d.push('translate: '+f(tfNum(p,'mx'))+'px '+f(tfNum(p,'my'))+'px','rotate: '+f(tfNum(p,'mr'))+'deg','scale: '+f(tfNum(p,'ms')/100));
      if(U.indexOf('t')>=0){
        const dur=Math.max(0,+st.dur||0);
        if(dur)d.push('transition: '+CD_TR.map(x=>x+' '+dur+'ms '+(st.ease||'ease')).join(', '));
        else if(Array.isArray(st.use))d.push('transition: none');
      }
      return d;
    }
    function cdAn(st){
      if(!stHas(st,'a'))return null;
      const A=anOf(st,stState(st,'n')||Object.assign({},ST_P),'c');
      return A?{sh:A.sh,kf:A.kf.replace(/\bfill: /g,'--ha-card-background: '),og:A.og}:null;
    }
    function cdStRule(st,sel,kf,edit,K){
      const d=cdDecl(st,edit);
      let c=d.length?sel+'{\n  '+d.join(';\n  ')+';\n}\n':'';
      const A=edit?null:cdAn(st);
      if(A){
        c+='@media (prefers-reduced-motion: no-preference){\n  '+sel+'{ animation: '+kf+' '+A.sh+';'+(A.og!=='center'?' transform-origin: '+A.og+';':'')+' }\n}\n';
        if(!K.has(kf)){K.add(kf);c+='@keyframes '+kf+'{ '+A.kf+' }\n';}
      }
      return c;
    }
    function cdClip(){
      let m=0;
      styles().forEach(x=>{if(!x||!stHas(x,'g'))return;const p=stState(x,'n');if(p&&p.g)m=Math.max(m,Math.max(Math.abs(+p.gx||0),Math.abs(+p.gy||0))+Math.max(0,+p.gb||0));});
      return m?'-'+Math.ceil(m+2)+'px':'0';
    }
    function cdStCSS(){
      const L=S.objects.filter(q=>cdCfg(q)&&cdStyled(q));if(!L.length)return '';
      const ids=stIds(),K=new Set(),kf=x=>'anim-'+ids.get(x.id)+'-c';
      let c='\n/* Cards with styles or rules: the look sits on div.cds, between div.cdb and the card. Fill, border and glow\n'+
        '   are theme variables of ha-card; opacity, transform, transition and animations are on the div. The card may\n'+
        '   go out of its box. */\n'+
        'foreignObject.card.cs, foreignObject.card.cs > div.cdb{ overflow: visible; }\n'+
        'foreignObject.card.cs > div.cdb > div.cds{ display: block; position: relative; width: 100%; height: 100%; clip-path: inset('+cdClip()+'); }\n';
      const used=new Set();L.forEach(q=>stysOf(q).forEach(x=>used.add(x)));
      styles().filter(x=>x&&used.has(x)).forEach(x=>{c+=cdStRule(x,'.card.'+ids.get(x.id)+' .cds',kf(x),false,K);});
      L.filter(q=>soConf(stysOf(q))).forEach(q=>stysOf(q).forEach(x=>{c+=cdStRule(x,':where('+cssId(q.id)+').card.'+ids.get(x.id)+' .cds',kf(x),false,K);}));
      L.forEach(q=>cdRules(q).slice().reverse().forEach(r=>idsStys(rSty(r)).forEach(x=>{c+=cdStRule(x,cssId(q.id)+'.r-'+rNum(r)+' .cds',kf(x),false,K);})));
      L.forEach(q=>cdTaps(q).slice().reverse().forEach(t=>idsStys(t.x.sty).forEach(x=>{c+=cdStRule(x,cssId(q.id)+t.key+' .cds',kf(x),false,K);})));
      return c;
    }
    function cdZd(){
      let m=0;
      S.objects.filter(q=>cdCfg(q)&&cdStyled(q)).forEach(q=>{
        stysOf(q).concat(...cdRules(q).map(r=>idsStys(rSty(r))),...cdTaps(q).map(t=>idsStys(t.x.sty))).forEach(x=>{if(stHas(x,'t'))m=Math.max(m,+x.dur||0);});
        cdGo(q).forEach(r=>mvMos(actMo(r)).forEach(st=>{m=Math.max(m,moDur(st));}));
      });
      return Math.round(Math.min(10000,m)+400);
    }

    const cdLines=(F,ind)=>[].concat(...S.objects.filter(q=>cdCfg(q)&&F(q)).map(q=>{
      const b=' x="'+f(q.x)+'" y="'+f(q.y)+'" width="'+f(Math.max(1,q.w))+'" height="'+f(Math.max(1,q.h))+'"',i=esc(q.id);
      return [ind+'<foreignObject id="'+i+'" class="'+esc(cdCls(q))+'"'+b+'><div xmlns="http://www.w3.org/1999/xhtml" '+
        (actRule(q)?'class="cdb"><div class="cds"><div id="'+i+'-c" class="cdc"></div><div id="'+i+'-v" class="velo"></div></div></div>':
          cdStyled(q)?'class="cdb"><div id="'+i+'-c" class="cds"></div></div>':'id="'+i+'-c" class="cdb"></div>')+'</foreignObject>'];
    }));
    const CDT='translate(var(--zx, 0px), var(--zy, 0px)) scale(var(--zk, 1))';
    function zkCap(w){
      const E=w.Element.prototype;if(E.__zkc)return;E.__zkc=1;
      const S=E.setPointerCapture,R=E.releasePointerCapture,H=E.hasPointerCapture,C=new Map();
      const inFo=el=>{for(let n=el;n;){const f=n.closest?n.closest('foreignObject'):null;if(f)return f!==el;const r=n.getRootNode?n.getRootNode():null;if(!r||!r.host)return false;n=r.host;}return false;};
      E.setPointerCapture=function(id){if(!inFo(this))return S.call(this,id);try{S.call(this,id);}catch(e){}C.set(id,this);};
      E.releasePointerCapture=function(id){if(C.get(id)!==this)return R.call(this,id);C.delete(id);try{R.call(this,id);}catch(e){}};
      E.hasPointerCapture=function(id){return C.get(id)===this||H.call(this,id);};
      const fwd=ev=>{
        const el=C.get(ev.pointerId);if(!el)return;
        if(ev.type!=='pointermove')C.delete(ev.pointerId);
        if(!el.isConnected||ev.composedPath().indexOf(el)>=0)return;
        el.dispatchEvent(new w.PointerEvent(ev.type,{bubbles:true,composed:true,cancelable:true,pointerId:ev.pointerId,pointerType:ev.pointerType,isPrimary:ev.isPrimary,
          clientX:ev.clientX,clientY:ev.clientY,screenX:ev.screenX,screenY:ev.screenY,button:ev.button,buttons:ev.buttons,pressure:ev.pressure,width:ev.width,height:ev.height}));
      };
      ['pointermove','pointerup','pointercancel'].forEach(t=>w.addEventListener(t,fwd,true));
    }
    function zkCtm(w){
      const G=w.SVGGraphicsElement.prototype,E=w.Element.prototype;if(G.__zkm)return;G.__zkm=1;
      const O=G.getScreenCTM,Q=E.getBoundingClientRect,up=n=>n.parentNode||n.host||null;
      const rt=n=>{while(n.ownerSVGElement)n=n.ownerSVGElement;return n;};
      const card=r=>{for(let n=up(r);n;n=up(n))if(n.localName==='foreignObject'){const b=n.firstElementChild;return b&&b.classList.contains('cdb')?n:null;}return null;};
      const dm=m=>new w.DOMMatrix([m.a,m.b,m.c,m.d,m.e,m.f]);
      const vb=r=>{
        const v=r.viewBox.baseVal,W=r.clientWidth,H=r.clientHeight;
        if(!v||!(v.width>0)||!(v.height>0))return new w.DOMMatrix();
        const p=r.preserveAspectRatio.baseVal,al=p.align;let sx=W/v.width,sy=H/v.height,tx=0,ty=0;
        if(al!==1){const k=p.meetOrSlice===2?Math.max(sx,sy):Math.min(sx,sy);sx=sy=k;tx=(W-v.width*k)*((al-2)%3)/2;ty=(H-v.height*k)*Math.floor((al-2)/3)/2;}
        return new w.DOMMatrix([sx,0,0,sy,tx-v.x*sx,ty-v.y*sy]);
      };
      G.getScreenCTM=function(){
        const m=O.call(this);if(!m)return m;
        const r=rt(this),fo=card(r);if(!fo)return m;
        const s=rt(fo),M=O.call(s),b=fo.firstElementChild,B=Q.call(b),R=Q.call(r),k=B.width/b.offsetWidth;
        if(!M||!(k>0))return m;
        let T=dm(M).translate(fo.x.baseVal.value+(R.left-B.left)/k,fo.y.baseVal.value+(R.top-B.top)/k).multiply(vb(r));
        if(this!==r)T=T.multiply(dm(O.call(r)).inverse()).multiply(dm(m));
        const X=s.createSVGMatrix();X.a=T.a;X.b=T.b;X.c=T.c;X.d=T.d;X.e=T.e;X.f=T.f;return X;
      };
      E.getBoundingClientRect=function(){
        const q=Q.call(this),fo=card(this);if(!fo)return q;
        const s=rt(fo),M=O.call(s),b=fo.firstElementChild,B=Q.call(b),k=B.width/b.offsetWidth;
        if(!M||!(k>0))return q;
        const x=fo.x.baseVal.value+(q.left-B.left)/k,y=fo.y.baseVal.value+(q.top-B.top)/k;
        return new w.DOMRect(M.a*x+M.c*y+M.e,M.b*x+M.d*y+M.f,q.width/k*M.a,q.height/k*M.d);
      };
    }
    const fnSrc=fn=>String(fn).split('\n').map(l=>l.trim()).filter(Boolean);
    function pgNav(w,svg,P){
      const L=svg.querySelector('#livelli');if(!L)return;
      const cur=()=>{const m=/(?:^|\s)pg-(\S+)/.exec(L.getAttribute('class')||'');return m?m[1]:P.f;};
      const want=()=>P.p.find(q=>'#'+q[1]===w.location.hash);
      const go=fx=>{
        if(!svg.isConnected)return;
        const q=want(),c=cur();if(!q||q[0]===c)return;
        L.setAttribute('class',fx&&q[2]?'pg-'+q[0]+' da-'+c+' tr-'+q[2]:'pg-'+q[0]);
      };
      go(false);
      const on=()=>w.setTimeout(()=>go(true),0);
      ['location-changed','popstate','hashchange'].forEach(t=>w.addEventListener(t,on));
      new w.MutationObserver(()=>{
        if(!svg.isConnected)return;
        const q=P.p.find(x=>x[0]===cur());if(!q||w.location.hash==='#'+q[1])return;
        try{w.history.replaceState(w.history.state,'',w.location.pathname+w.location.search+'#'+q[1]);}catch(e){}
      }).observe(L,{attributes:true,attributeFilter:['class']});
    }
    function swNav(w,svg,M,D){
      let st=null,eat=0;
      const hit=e=>{const P=e.composedPath?e.composedPath():[];for(let i=0;i<P.length&&P[i]!==svg;i++){const id=P[i]&&P[i].id;if(id&&M[id])return M[id];}return null;};
      svg.addEventListener('pointerdown',e=>{const m=e.isPrimary?hit(e):null;st=m?{m:m,x:e.clientX,y:e.clientY,t:w.performance.now(),p:e.pointerId,k:0}:null;},true);
      svg.addEventListener('touchmove',e=>{
        const q=e.touches&&e.touches[0];if(!st||!q||e.touches.length>1)return;
        if(!st.k){const dx=Math.abs(q.clientX-st.x),dy=Math.abs(q.clientY-st.y);st.k=dx>=dy?(st.m.l||st.m.r?1:2):(st.m.u||st.m.d?1:2);}
        if(st.k===1&&e.cancelable)e.preventDefault();
      },{capture:true,passive:false});
      const end=e=>{
        if(!st||e.pointerId!==st.p)return;
        const s=st;st=null;
        if(e.type!=='pointerup'||!svg.isConnected)return;
        const dx=e.clientX-s.x,dy=e.clientY-s.y,ax=Math.abs(dx),ay=Math.abs(dy),a=Math.max(ax,ay);
        if(w.performance.now()-s.t>D[1]||a<D[0]||a<D[2]*Math.min(ax,ay))return;
        const id=s.m[ax>ay?(dx<0?'l':'r'):(dy<0?'u':'d')],h=id?svg.querySelector('#'+id):null;
        if(!h)return;
        eat=w.performance.now()+400;
        h.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
      };
      w.addEventListener('pointerup',end,true);
      w.addEventListener('pointercancel',end,true);
      w.addEventListener('click',e=>{if(e.isTrusted&&eat&&w.performance.now()<eat){eat=0;e.stopPropagation();e.preventDefault();}},true);
    }
    function swNavYAML(){
      const M=swEls().M;if(!Object.keys(M).length)return '';
      const src='('+fnSrc(swNav).join('\n')+')(w, svg, M, D);';
      const J=["const w = svg.ownerDocument.defaultView;","const M = "+JSON.stringify(M)+";","const D = "+JSON.stringify([SW_PX,SW_MS,SW_K])+";","let fn = null;",
        "try { fn = new w.Function('w', 'svg', 'M', 'D', "+JSON.stringify(src)+"); } catch (e) {}",
        "if (fn) fn(w, svg, M, D);","else {",...src.split('\n').map(l=>'  '+l),"}"];
      return '  - service: floorplan.execute\n    service_data: |\n      >\n'+J.map(l=>'      '+l+'\n').join('');
    }
    const CD_JS=[
      "const w = svg.ownerDocument.defaultView;",
      "try { new w.Function('w', "+JSON.stringify('('+fnSrc(zkCap).join('\n')+')(w);')+")(w); } catch (e) {",
      ...('('+fnSrc(zkCap).join('\n')+')(w);').split('\n').map(l=>'  '+l),
      "}",
      "if (!w.CSS.supports('hanging-punctuation', 'first')) return;",
      "svg.classList.add('zk');",
      "try { new w.Function('w', "+JSON.stringify('('+fnSrc(zkCtm).join('\n')+')(w);')+")(w); } catch (e) {",
      ...('('+fnSrc(zkCtm).join('\n')+')(w);').split('\n').map(l=>'  '+l),
      "}",
      "const upd = () => {",
      "  const m = svg.getScreenCTM(), r = svg.getBoundingClientRect();",
      "  if (!m) return;",
      "  svg.style.setProperty('--zk', String(m.a));",
      "  svg.style.setProperty('--zx', (m.e - r.left) + 'px');",
      "  svg.style.setProperty('--zy', (m.f - r.top) + 'px');",
      "};",
      "new w.ResizeObserver(upd).observe(svg);",
      "upd();",
      "const zt = new w.Set(); let zr = 0;",
      "const nudge = fo => { zt.add(fo); if (zr) return; zr = w.requestAnimationFrame(() => { zr = 0; zt.forEach(f => f.classList.toggle('zr')); zt.clear(); }); };",
      "let zu = 0;",
      "const burst = ms => { const go = !zu, t = w.performance.now() + Math.min(10000, ms || 400); if (t > zu) zu = t; if (!go) return; const tick = () => { svg.querySelectorAll('foreignObject.card').forEach(nudge); if (w.performance.now() < zu) w.requestAnimationFrame(tick); else zu = 0; }; tick(); };",
      "const sec = v => (parseFloat(v) || 0) * (/ms/.test(v) ? 1 : 1000);",
      "const tdur = e => { try { const cs = w.getComputedStyle(e.target), D = cs.transitionDuration.split(','), L = cs.transitionDelay.split(','); let m = 0; D.forEach((d, i) => { m = Math.max(m, sec(d) + sec(L[i % L.length])); }); return m + 100; } catch (x) { return 400; } };",
      "const seen = new w.WeakSet();",
      "const deep = (n, fo) => { if (!n || (n.nodeType !== 1 && n.nodeType !== 11)) return; if (n.shadowRoot) watch(n.shadowRoot, fo); if (n.querySelectorAll) n.querySelectorAll('*').forEach(x => { if (x.shadowRoot) watch(x.shadowRoot, fo); }); };",
      "const watch = (root, fo) => { if (!root || seen.has(root)) return; seen.add(root); root.addEventListener('transitionrun', e => burst(tdur(e))); new w.MutationObserver(ms => { burst(); ms.forEach(m => m.addedNodes.forEach(x => deep(x, fo))); }).observe(root, { subtree: true, childList: true, attributes: true, characterData: true }); deep(root, fo); };",
      "svg.querySelectorAll('foreignObject.card > div.cdb').forEach(d => watch(d, d.parentNode));"];
    function cdCSS(){
      const L=S.objects.filter(cdCfg);if(!L.length)return '';
      let c='\n/* Home Assistant cards (floorplan.card_set in a foreignObject). WebKit (iPad, iPhone, Safari) draws their\n'+
        '   positioned content without the scale of the viewBox: the startup code puts the class zk on the svg with\n'+
        '   --zk (scale), --zx and --zy (offset of the bands), and this transform puts the cards back in place. */\n'+
        'svg.zk foreignObject.card > *{ display: block; position: relative; transform: '+CDT+'; }\n'+
        '/* The card sits in a div, as in the editor. */\nforeignObject.card > div.cdb{ display: block; position: relative; width: 100%; height: 100%; overflow: hidden; }\n'+
        'foreignObject.card, foreignObject.card > div.cdb{ touch-action: none; }\n'+
        '/* Only the card itself catches taps: the empty part of its box lets them through. */\n'+
        '#livelli foreignObject.card, #livelli foreignObject.card > div.cdb, #livelli foreignObject.card div.cds{ pointer-events: none !important; }\n'+
        '#livelli foreignObject.card > div.cdb > :not(.cds), #livelli foreignObject.card div.cds > *{ pointer-events: auto !important; }\n'+
        (L.some(q=>actRule(q))?'/* The veil of a card with a tap action: above the card, inside div.cds, so it follows the card. */\n'+
          'foreignObject.card div.cdc{ display: block; position: relative; width: 100%; height: 100%; }\n'+
          'foreignObject.card div.velo{ position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 2147483647; background: transparent; cursor: pointer; touch-action: none; }\n'+
          L.filter(q=>actRule(q)).map(q=>'#livelli #'+q.id+'-c, #livelli #'+q.id+'-c *').join(', ')+'{ pointer-events: none !important; }\n'+
          L.filter(q=>actRule(q)).map(q=>'#livelli #'+q.id+' #'+q.id+'-v').join(', ')+'{ pointer-events: auto !important; }\n':'')+
        'svg.zk foreignObject.card{ opacity: 0.999; }\nsvg.zk foreignObject.card.zr{ opacity: 0.998; }\n';
      L.forEach(q=>{c+='#'+q.id+' > *{ transform-origin: '+f(-q.x)+'px '+f(-q.y)+'px; }\n';});
      return c+cdTrCSS(L)+cdStCSS();
    }
    function cdTrCSS(L){
      const P=new Set(L.map(q=>q.pg).filter(Boolean));
      if(!hasPgs()||!P.size)return '';
      const U=pgTrUsed();if(!U.size)return '';
      const dec=o=>Object.keys(o).map(k=>k+': '+o[k]).join('; ');
      const kf=(n,F)=>'@keyframes '+n+'{ from{ '+dec(F[0])+'; } to{ '+dec(F[1])+'; } }\n';
      let c='/* WebKit: during Go to page the cards repeat the transition of their page. */\n';
      U.forEach(u=>{
        const T=u.T,k=T.t+(T.d?'-'+T.d:''),ti=pgTime(T,false),to=pgTime(T,true);
        PGS().forEach(p=>{
          if(!P.has(p.id))return;
          const A=pgA(p),n=k+'-'+p.id,cx=f(A.x+A.w/2),cy=f(A.y+A.h/2);
          const W=F=>F.map(o=>{const r=Object.assign({},o);if(r.transform)r.transform=CDT+' translate('+cx+'px, '+cy+'px) '+r.transform+' translate('+f(-cx)+'px, '+f(-cy)+'px)';return r;});
          c+=kf('cd-in-'+n,W(pgFrames(T,A,false)))+kf('cd-out-'+n,W(pgFrames(T,A,true)));
          if(u.to.has(p.id))c+='svg.zk #livelli.tr-'+T.tok+'.pg-'+p.id+' #'+p.id+' foreignObject.card > *{ animation: cd-in-'+n+' '+ti.d+'ms ease-in-out'+(ti.w?' '+ti.w+'ms':'')+' both; }\n';
          c+='svg.zk #livelli.tr-'+T.tok+'.da-'+p.id+' #'+p.id+' foreignObject.card > *{ animation: cd-out-'+n+' '+to.d+'ms ease-in-out both; }\n';
        });
      });
      return c;
    }
    const YK=/^[A-Za-z_][A-Za-z0-9_-]*$/;
    function yamlOf(v,ind){
      const sc=x=>Array.isArray(x)?'[]':isObj(x)?'{}':x===null||x===undefined?'null':typeof x==='number'||typeof x==='boolean'?String(x):JSON.stringify(String(x));
      const full=x=>Array.isArray(x)&&x.length||isObj(x)&&Object.keys(x).length;
      if(Array.isArray(v))return v.map(x=>{
        if(isObj(x)&&full(x))return ind+'- '+yamlOf(x,ind+'  ').slice(ind.length+2);
        if(full(x))return ind+'-\n'+yamlOf(x,ind+'  ');
        return ind+'- '+sc(x)+'\n';
      }).join('');
      return Object.keys(v).map(k=>{
        const x=v[k],kk=YK.test(k)?k:JSON.stringify(k);
        return full(x)?ind+kk+':\n'+yamlOf(x,ind+'  '):ind+kk+': '+sc(x)+'\n';
      }).join('');
    }
    function moRegYAML(){
      const V=bindRules().filter(b=>b.x.p==='mo').map(b=>bindVar(b.r)).concat(...amGoR().map(r=>mvMos(actMo(r)).map(amVar))).filter((v,i,a)=>a.indexOf(v)===i);if(!V.length)return '';
      const J=["const w = svg.ownerDocument.defaultView;",
        JSON.stringify(V)+".forEach(n => { try { w.CSS.registerProperty({ name: n, syntax: '<number>', inherits: true, initialValue: '0' }); } catch (e) {} });"];
      return '  - service: floorplan.execute\n    service_data: |\n      >\n'+J.map(l=>'      '+l+'\n').join('');
    }
    function cdConfYAML(){
      const L=S.objects.filter(cdCfg),N=pgNavYAML()+moRegYAML()+swNavYAML();if(!L.length)return N?'startup_action:\n'+N:'';
      const A=[].concat(...L.map(cdTaps)).map(t=>t.ak).concat(L.some(q=>cdGo(q).length)?['data-m']:[]).filter((a,i,X)=>X.indexOf(a)===i);
      const J=L.some(cdStyled)?CD_JS.concat([
        "const zc = fo => (fo.getAttribute('class') || '').split(' ').filter(c => c && c !== 'zr').sort().join(' ')"+(A.length?" + '|' + "+JSON.stringify(A)+".map(a => fo.getAttribute(a) || '').join(' ')":"")+";",
        "const zp = fo => { const t0 = w.performance.now(); const go = () => { nudge(fo); if (w.performance.now() - t0 < "+cdZd()+") w.setTimeout(go, 50); }; go(); };",
        "svg.querySelectorAll('foreignObject.card.cs').forEach(fo => { let k = zc(fo); new w.MutationObserver(() => { const n = zc(fo); if (n !== k) { k = n; zp(fo); } }).observe(fo, { attributes: true, attributeFilter: "+(A.length?JSON.stringify(['class'].concat(A)).replace(/"/g,"'").replace(/,/g,', '):"['class']")+" }); });"]):CD_JS;
      return 'startup_action:\n  - service: floorplan.card_set\n    service_data:\n'+
        L.map(q=>'      - container_id: '+q.id+'-c\n        config:\n'+yamlOf(q.cfg,'          ')).join('')+
        '  - service: floorplan.execute\n    service_data: |\n      >\n'+J.map(l=>'      '+l+'\n').join('')+N;
    }
    function pgNavYAML(){
      if(!hasPgs())return '';
      const P={f:PGS()[0].id,p:PGS().map(p=>{const T=pgTr(p);return [p.id,p.ad,T.t==='none'?'':T.tok];})},src='('+fnSrc(pgNav).join('\n')+')(w, svg, P);';
      const J=["const w = svg.ownerDocument.defaultView;","const P = "+JSON.stringify(P)+";","let fn = null;",
        "try { fn = new w.Function('w', 'svg', 'P', "+JSON.stringify(src)+"); } catch (e) {}",
        "if (fn) fn(w, svg, P);","else {",...src.split('\n').map(l=>'  '+l),"}"];
      return '  - service: floorplan.execute\n    service_data: |\n      >\n'+J.map(l=>'      '+l+'\n').join('');
    }

    let flNar={l:false,r:false},flW={l:null,r:null},flXord=null,flSl='',flSlOn=false;
    const flFolded=w=>!!flNar[w];
    function flColsReset(){const c=flow&&flCv;flNar={l:false,r:c};flW={l:null,r:null};flXord=null;flSl='';}
    function flColW(){
      ['l','r'].forEach(w=>{const v=flNar[w]?'80px':flW[w]!=null?flW[w]+'px':'';
        if(v)E.wk.style.setProperty('--flw-'+w,v);else E.wk.style.removeProperty('--flw-'+w);});
      if(flCv&&!flNar.l)E.fcl.style.setProperty('--fcw',(flW.l!=null?flW.l:FL.CW)+'px');else E.fcl.style.removeProperty('--fcw');
    }
    const FL={S:14,GAP:12,TRI:9,BLUE:'#2F7FF0',GREY:'#AEB7C3',CW:212};
    const FL_SEC={f:'fill',b:'border',g:'glow',o:'opacity',m:'blend',x:'transform',a:'animation'};
    const FL_IC={
      bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
      moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
      shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
      therm:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
      hand:'<path d="M9 11V5a2 2 0 0 1 4 0v6l4 1a2 2 0 0 1 1.5 2.3L17 20H9l-3-4a1.6 1.6 0 0 1 2.5-2L9 15"/>',
      flag:'<path d="M5 21V4h12l-2.5 4L17 12H5"/>',
      gauge:'<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
      door:'<path d="M6 21V3h12v18M4 21h16M14 12h.01"/>',
      photo:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.5"/>',
      sw:'<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>',
      warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
      zone:'<path d="M4 6l7-3 9 4-2 11-10 3-5-7z"/>',
      text:'<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
      star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
      clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      nav:'<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'
    };
    const flSvg=k=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+FL_IC[k]+'</svg>';
    function flIco(k){
      if(k.k==='tap')return flSvg('hand');
      const d=entDom(k.e);
      return flSvg(d==='light'||d==='switch'?'bulb':d==='sun'?'moon':d==='alarm_control_panel'||d==='lock'?'shield':
        d==='binary_sensor'||d==='cover'?'door':d==='sensor'||d==='number'||d==='input_number'||d==='climate'?'therm':k.k==='data'?'gauge':'flag');
    }

    const txKey=s=>'txt:'+stysOf(s).map(q=>q.id).join(',');
    function fxKey(x,s){
      if(x.k==='follow'&&x.p==='text')return txKey(s);
      if(x.k==='look')return 'look:'+(Array.isArray(x.sty)?x.sty.slice().sort((a,b)=>a-b):[]).join(',');
      if(x.k==='sym')return 'sym:'+(x.icon||'');
      if(x.k==='act'){
        const a=actA(x);
        if(a==='sty')return 'act:sty:'+(Array.isArray(x.sty)?x.sty.slice().sort((p,q)=>p-q):[]).join(',')+'>'+(x.to||[]).join(',');
        if(a==='svc')return 'act:svc:'+[x.svc||'',x.e||'',x.d||''].join('|');
        if(a==='page')return 'act:page:'+(x.pg||'')+'|'+(PG_TT.indexOf(x.tt)>=0?pgTr(x).tok:'');
        if(a==='nav')return 'act:nav:'+(x.u||'');
        if(a==='info')return 'act:info:'+(x.e||'');
        return a?'act:'+(x.e||''):'act:?';
      }
      if(x.k==='pho')return 'pho:'+(x.n||'');
      if(x.k==='mv')return 'mv:'+(moGo(x)?'g'+moPt(x):'p')+':'+(Array.isArray(x.mo)?x.mo.slice().sort((p,q)=>p-q):[]).join(',')+'>'+(x.to||[]).join(',');
      if(isBind(x))return 'fol:'+x.p+':'+(x.p==='mo'?(x.mo||'')+':':'')+JSON.stringify([bindIn(x),bindOut(x),x.pv||'',x.an||'',x.p==='fc'?[bindA(x,0),bindA(x,1)]:0,bindTm(x)]);
      return 'fol:'+(x.p==='text'?'text:'+[x.dec==null?'':x.dec,x.pre||'',x.suf||''].join('|'):'opacity:'+(x.map||'brightness')+(x.ph?':'+x.ph:''));
    }
    function fxLabel(x,s){
      if(s!==undefined&&x.k==='follow'&&x.p==='text'){const L=stysOf(s);return L.length?L.map(q=>q.n||'(unnamed)').join(' + '):'no style';}
      if(x.k==='look'){const L=idsStys(x.sty);return L.length?'Look: '+L.map(q=>q.n||'(unnamed)').join(' + '):'Look: no style';}
      if(x.k==='sym')return x.icon?'Symbol '+x.icon.replace(/^mdi:/,''):'Symbol: none';
      if(x.k==='act'){
        const a=actA(x);
        if(a==='sty'){const L=idsStys(x.sty);return 'Apply style: '+(L.length?L.map(q=>q.n||'(unnamed)').join(' + '):'no style');}
        if(a==='svc')return x.svc?'Call '+x.svc+(x.e?' '+x.e:''):'Call: no service';
        if(a==='page'){const P=pgOf(x.pg),T=pgTrOf(x);return P?'Go to '+pgName(P)+(T.t==='none'?'':' · '+T.t+(T.d?' '+PG_DIR[T.t].find(q=>q[0]===T.d)[1]:'')):'Go to page: none';}
        if(a==='nav')return x.u?'Navigate '+x.u:'Navigate: no address';
        if(!a)return 'Tap: no action';
        if(a==='info')return x.e?'More info '+x.e:'More info: no entity';
        return x.e?'Switch '+x.e:'Switch: no entity';
      }
      if(x.k==='pho')return 'Show photo '+(x.n?'“'+x.n+'”':'(none)');
      if(x.k==='mv'){const L=mvMos(x);return 'Apply motion: '+(L.length?L.map(q=>q.n||'(unnamed)').join(' + '):'no motion')+(moGo(x)?' · go to '+moPt(x)+' %':'');}
      if(isBind(x))return BIND_L[x.p].charAt(0).toUpperCase()+BIND_L[x.p].slice(1)+' ← value';
      if(x.p==='text')return 'Text: '+(x.pre||'')+(x.dec!=null?(0).toFixed(x.dec):'value')+(x.suf||'');
      return 'Photo'+(x.ph?' “'+x.ph+'”':'')+' ← '+(FMAPS[x.map]||FMAPS.brightness);
    }
    function fxDesc(x){
      if(x.k==='look')return 'applies the look while the rule is true';
      if(x.k==='sym')return 'icons show this symbol while the rule is true';
      if(x.k==='act'){
        const a=actA(x);
        if(a==='sty'){const O=(x.to||[]).map(tgtOf).filter(Boolean);return 'a tap switches the style on '+(O.length?O.map(o=>o.n||o.id).join(', '):'nothing yet')+' until the page reloads';}
        if(a==='svc')return x.svc?'a tap calls '+x.svc:'a tap calls nothing yet';
        if(a==='page'){const P=pgOf(x.pg);return P?'a tap opens the page '+pgName(P):'a tap opens no page yet';}
        if(a==='nav')return x.u?'a tap opens '+x.u:'a tap opens nothing yet';
        if(!a)return 'a tap does nothing yet';
        if(a==='info')return x.e?'a tap opens the more-info of '+x.e:'a tap opens nothing yet';
        return x.e?'a tap calls '+actSvc(x.e):'a tap calls nothing yet';
      }
      if(x.k==='pho')return 'zones with a photo of this name show it and hide their other photos';
      if(x.k==='mv'){const O=(x.to||[]).map(tgtOf).filter(Boolean),t=O.length?O.map(o=>o.n||o.id).join(', '):'nothing yet';
        return moGo(x)?'a tap moves '+t+' from where it is to '+moPt(x)+' % of the motion':'a tap plays the motion on '+t;}
      if(x.p==='mo'&&isBind(x)){const I=bindIn(x),d=moDrv(x);return (d?'“'+(d.n||'(unnamed)')+'”':'the motion')+' follows the value ('+f(I[0])+'–'+f(I[1])+')';}
      if(isBind(x)){const I=bindIn(x),O=bindOut(x);return 'the '+BIND_L[x.p]+' follows the value'+(x.p==='fc'?'':' ('+f(I[0])+'–'+f(I[1])+' → '+f(O[0])+'–'+f(O[1])+(BIND_U[x.p]||'')+')');}
      if(x.p==='text')return 'the label shows the value';
      return 'the photo opacity follows the value ('+(FMAPS[x.map]||FMAPS.brightness)+')';
    }
    function fxThumb(x,s){
      if(x.k==='look'){const L=idsStys(x.sty);return L.length?'<svg viewBox="0 0 30 20">'+(isAn(L[0])?'<path d="M11 4v12l10-6z" fill="currentColor"/>':stMini(L[0],'n','flx'+L[0].id,L[0].id))+'</svg>':'—';}
      if(x.k==='sym'){const d=iconPath(x.icon);return d?'<svg viewBox="0 0 24 24"><path fill="currentColor" d="'+d+'"/></svg>':'★';}
      if(x.k==='mv')return '<svg viewBox="0 0 30 20"><path d="M11 4v12l10-6z" fill="currentColor"/></svg>';
      if(x.k==='act'){
        const L=actA(x)==='sty'?idsStys(x.sty):[];
        return L.length?'<svg viewBox="0 0 30 20">'+stMini(L[0],'n','flx'+L[0].id,L[0].id)+'</svg>':flSvg('sw');
      }
      if(x.p==='text'){
        const v=((x.pre||'')+(x.dec!=null?(21.46).toFixed(x.dec):'21.46')+(x.suf||'')).slice(0,40);
        const M=s?stMerge(defOf(-1),stysOf(s)):defOf(-1),P=stState(M,'n'),pre='flt'+(s?s.id:'d');
        const ds=stDefs(M,pre,'',SWM).join(''),fs=clamp(52/(Math.max(1,v.length)*.6),7,20);
        return '<svg viewBox="0 0 57 42">'+(ds?'<defs>'+ds+'</defs>':'')+'<text x="28.5" y="21" font-size="'+f(fs)+'" font-weight="600" text-anchor="middle" dominant-baseline="central" '+
          stAttrs(P,'grad-'+pre+'-n','glow-'+pre+'-n',true)+txAttrs(M)+'>'+esc(v)+'</text></svg>';
      }
      return flSvg('photo');
    }
    const fxVoid=x=>!!x&&x.k==='look'&&!idsStys(x.sty).length;
    const fxHid=x=>!!x&&x.k==='follow'&&x.p==='text';
    const fxShown=x=>!!x&&!fxVoid(x)&&!fxHid(x);
    const rOutHid=r=>{const X=(Array.isArray(r.fx)?r.fx:[]).filter(x=>x&&!fxVoid(x));return X.length>0&&X.every(fxHid);};
    function flEffects(){
      const M=new Map();
      const add=(k,x,r,s)=>{if(!M.has(k))M.set(k,{key:k,fx:x,rules:[],pend:false,s:s});const q=M.get(k);if(q.rules.indexOf(r)<0)q.rules.push(r);};
      RULS().forEach(r=>(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{
        if(!fxShown(x))return;
        add(fxKey(x),x,r,null);
      }));
      flPend.forEach(x=>{const k=fxKey(x);if(!M.has(k))M.set(k,{key:k,fx:x,rules:[],pend:true,s:null});});
      return [...M.values()];
    }
    const flFx=k=>flEffects().find(q=>q.key===k)||null;
    function flEffOrd(){
      const L=flEffects();if(!flXord)return L;
      const o=k=>{const i=flXord.indexOf(k);return i<0?1e9:i;};
      return L.map((q,i)=>[q,i]).sort((a,b)=>o(a[0].key)-o(b[0].key)||a[1]-b[1]).map(x=>x[0]);
    }
    function flSort(){
      let pos;
      if(!flCv){const rk=new Map();let n=0;for(let i=S.objects.length-1;i>=0;i--)rk.set(S.objects[i].id,n++);BGS().slice().reverse().forEach(b=>rk.set(b.id,n++));pos=s=>rk.get(s.id);}
      else{const RW=flRows();pos=(s,r)=>{const q=(RW.get(s.id)||[]).find(x=>x.r===r);return q?q.out.y:null;};}
      const acc=new Map(),add=(key,v)=>{if(v==null)return;const a=acc.get(key)||[0,0];a[0]+=v;a[1]++;acc.set(key,a);};
      RULS().forEach(r=>{
        const X=(Array.isArray(r.fx)?r.fx:[]).filter(fxShown);
        rTgs(r).forEach(s=>{const v=pos(s,r);rCs(r).forEach(k=>add('c:'+k.id,v));X.forEach(x=>add('x:'+fxKey(x,s),v));});
      });
      const avg=k=>{const a=acc.get(k);return a?a[0]/a[1]:Infinity;};
      const by=(L,key)=>L.map((v,i)=>[v,i,avg(key(v))]).sort((a,b)=>(a[2]===b[2]?0:a[2]-b[2])||a[1]-b[1]).map(q=>q[0]);
      const C0=CAUS(),C=by(C0,k=>'c:'+k.id),cm=C.some((k,i)=>k!==C0[i]);
      const X0=flEffOrd().map(q=>q.key);flXord=by(flEffects(),q=>'x:'+q.key).map(q=>q.key);
      const xm=flXord.some((k,i)=>k!==X0[i]);
      if(cm){settle();S.causes=C;render();store(true);flush();}else flCols();
      stamp(cm||xm?'causes and effects sorted by object position':'already in order');
    }

    function flElBox(s){
      const p=posOf(s);let lx0,lx1,ly0,ly1;
      if(s.t==='icon'){const h=(s.size||28)/2;lx0=ly0=-h;lx1=ly1=h;}
      else{
        const tx=lblTx(s),sz=tx.fs||s.size||18,ft=folNow(s,'text'),t=ft!=null?ft:(s.txt||'text');
        const w=Math.max(20,String(t).length*(sz*(tx.up?0.7:0.6)+(tx.ls||0))),ax=tx.ta==='start'?0:tx.ta==='end'?-w:-w/2;
        lx0=ax;lx1=ax+w;ly0=-sz*0.7;ly1=sz*0.7;
      }
      const M=elMat(s),b=bx();
      [[lx0,ly0],[lx1,ly0],[lx1,ly1],[lx0,ly1]].forEach(q=>bxAdd(b,p.x+M[0]*q[0]+M[2]*q[1],p.y+M[1]*q[0]+M[3]*q[1]));
      return b;
    }
    function flOutline(s){
      const arc=(cx,cy,rx,ry,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180;o.push({x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)});}return o;};
      const box=b=>[{x:b.x0,y:b.y0},{x:b.x1,y:b.y0},{x:b.x1,y:b.y1},{x:b.x0,y:b.y1}];
      if(isBgl(s))return box({x0:0,y0:0,x1:S.w,y1:S.h});
      if(isEl(s))return box(flElBox(s));
      if(s.t==='rect'||s.t==='card')return box({x0:s.x,y0:s.y,x1:s.x+s.w,y1:s.y+s.h});
      if(s.t==='circle')return arc(s.cx,s.cy,s.rr,s.rr,0,360,36);
      if(s.t==='ring'){
        const a0=s.a0,a1=a0+Math.max(0,Math.min(359.9,s.a1-a0)),n=Math.max(4,Math.ceil((a1-a0)/6));
        return arc(s.cx,s.cy,s.r2,s.r2,a0,a1,n).concat(s.r1>0?arc(s.cx,s.cy,s.r1,s.r1,a1,a0,n):[{x:s.cx,y:s.cy}]);
      }
      if(s.t==='callout'){
        const g=coInfo(s);
        if(g.ell)return arc(g.x+g.w/2,g.y+g.h/2,g.w/2,g.h/2,0,360,32);
        const h=Math.max(g.h,2),w=Math.max(g.w,2),x=g.w<2?g.x-1:g.x,y=g.h<2?g.y-1:g.y;
        return box({x0:x,y0:y,x1:x+w,y1:y+h});
      }
      const p=ptsOf(s)||[],n=p.length,tens=s.tens||0;
      if(crOn(p,tens)&&n>=3){
        const o=[];
        crSegs(p,tens,true).forEach(g=>{
          if(g.l){o.push({x:g.a.x,y:g.a.y});return;}
          for(let j=0;j<8;j++)o.push(bzAt(g,j/8));
        });
        return o;
      }
      return p.map(q=>({x:q.x,y:q.y}));
    }
    function flScan(P,y){
      const xs=[];
      for(let i=0;i<P.length;i++){
        const a=P[i],b=P[(i+1)%P.length];if(a.y===b.y)continue;
        if(y>=Math.min(a.y,b.y)&&y<Math.max(a.y,b.y))xs.push(a.x+(y-a.y)*(b.x-a.x)/(b.y-a.y));
      }
      return xs.length?[Math.min(...xs),Math.max(...xs)]:null;
    }
    let flRowsC=null;
    const flPgS=s=>!hasPgs()||isBgl(s)||!s.pg||s.pg===cpg();
    function flRows(){
      const key=zoom+'|'+cpg()+'|'+JSON.stringify([S.objects,BGS().map(b=>b.id),S.w,S.h,RULS().map(r=>[r.id,r.c,r.j||'',r.on]),(S.groups||[]).map(g=>[g.id,g.p])]);
      if(flRowsC&&flRowsC.key===key)return flRowsC.m;
      const u=1/zoom,blocks=[];
      S.objects.concat(BGS()).forEach(s=>{
        if(!flPgS(s))return;
        const rows=[];
        RULS().forEach(r=>{if(rHas(r,s)){const n=rCs(r).length;rows.push({r:r,kind:n<2?'one':rOr(r)?'or':'and',k:Math.max(1,n)});}});
        if(!rows.length)return;
        const P=flOutline(s),bb=bx();P.forEach(q=>bxAdd(bb,q.x,q.y));
        if(!isFinite(bb.x0))return;
        const H=Math.max(bb.y1-bb.y0,1),n=rows.reduce((a,q)=>a+q.k,0);
        const sp=Math.max(.5*u,Math.min(FL.S*u,(H-4*u)/Math.max(1,n+.6*(rows.length-1))));
        let p=0;
        rows.forEach((q,i)=>{if(i)p+=sp*.6;q.rel=[];for(let j=0;j<q.k;j++){q.rel.push(p);p+=sp;}});
        p-=sp;rows.forEach(q=>{q.rel=q.rel.map(v=>v-p/2);});
        const half=p/2,c=(bb.y0+bb.y1)/2;
        const mg=Math.min(4*u,H/4);
        blocks.push({s:s,P:P,bb:bb,rows:rows,c:c,lo:Math.min(c,bb.y0+mg+half),hi:Math.max(c,bb.y1-mg-half)});
      });
      const G=FL.GAP*u,placed=[];
      blocks.slice().sort((a,b)=>(a.hi-a.lo)-(b.hi-b.lo)||a.c-b.c).forEach(B=>{
        const ys=[];B.rows.forEach(q=>q.rel.forEach(v=>ys.push(v)));
        const score=c=>{let m=Infinity;ys.forEach(v=>placed.forEach(y=>{const d=Math.abs(c+v-y);if(d<m)m=d;}));return m;};
        let best=B.c,bs=score(B.c);
        const look=(lo,hi)=>{
          for(let k=1;bs<G&&k<=4000;k++){
            const d=k*.5*u;let any=false;
            for(const c of [B.c-d,B.c+d]){
              if(c<lo||c>hi)continue;any=true;
              const sc=score(c);if(sc>=G){best=c;bs=sc;break;}
              if(lo>-Infinity&&sc>bs){best=c;bs=sc;}
            }
            if(!any)break;
          }
        };
        look(B.lo,B.hi);
        B.c=best;ys.forEach(v=>placed.push(B.c+v));
      });
      const m=new Map();
      blocks.forEach(B=>{
        const bb=B.bb;
        const at=y=>{const q=flScan(B.P,clamp(y,bb.y0+.5*u,bb.y1-.5*u))||[bb.x0,bb.x1];return {xl:q[0],xr:q[1]};};
        m.set(B.s.id,B.rows.map(q=>{
          const ys=q.rel.map(v=>B.c+v),mid=ys.reduce((a,b)=>a+b,0)/ys.length,o=at(mid);
          return {r:q.r,kind:q.kind,ys:ys,xl:o.xl-24*u,out:{x:o.xr+6*u,y:mid},
            tips:q.kind==='and'?[{x:o.xl-u,y:mid}]:ys.map(y=>({x:at(y).xl-u,y:y}))};
        }));
      });
      flRowsC={key:key,m:m};
      return m;
    }

    function flChains(){
      const ed=[],F=flFoc;
      RULS().forEach(r=>{
        const kd=rKind(r),nat=kd==='tap'?'tap':kd==='data'?'data':'cond',K=rCs(r),X=(Array.isArray(r.fx)?r.fx:[]).filter(fxShown);
        rTgs(r).forEach(s=>{
          if(flCv&&!flPgS(s))return;
          K.forEach((k,i)=>ed.push({side:'L',a:'c:'+k.id,s:s,r:r,i:i,nat:nat}));
          X.forEach(x=>ed.push({side:'R',b:'x:'+fxKey(x,s),s:s,r:r,nat:nat}));
        });
      });
      const on=e=>{
        if(!F)return false;
        if(F.k==='c')return rCs(e.r).some(k=>k.id===F.id);
        if(F.k==='x')return (e.r.fx||[]).some(x=>x&&fxKey(x,e.s)===F.id)&&(e.side==='L'||e.b==='x:'+F.id);
        if(F.k==='r')return e.r.id===F.id;
        return e.s.id===F.id;
      };
      const items=new Set(),objs=new Set(),rows=new Set();
      ed.forEach(e=>{e.on=on(e);if(e.on){items.add(e.side==='L'?e.a:e.b);objs.add(e.s.id);rows.add(e.s.id+'|'+e.r.id);}});
      if(F&&F.k==='o')objs.add(F.id);
      return {ed:ed,items:items,objs:objs,rows:rows};
    }
    function flCheck(){
      const F=flFoc;if(!F)return;
      const ok=F.k==='c'?!!causeOf(F.id):F.k==='r'?!!ruleOf(F.id):F.k==='o'?!!foOf(F.id):!!flFx(F.id);
      if(!ok){flFoc=null;flOpen='';}
      if(flMenu&&(flMenu.r&&!ruleOf(flMenu.r)||flMenu.o&&!foOf(flMenu.o)))flMenu=null;
    }

    function flObjNames(L){return L.slice(0,6).map(s=>s.n||s.id).join(', ')+(L.length>6?', …':'');}
    function flEntN(e){
      const h=self._hass,st=simStates(true)[e],fn=String((st&&st.attributes&&st.attributes.friendly_name)||e);
      const r=h&&h.entities&&h.entities[e],d=r&&r.device_id&&h.devices?h.devices[r.device_id]:null,dn=d?String(d.name_by_user||d.name||'').trim():'';
      return dn&&fn.toLowerCase().indexOf(dn.toLowerCase())<0?dn+' '+fn:fn;
    }
    function flCN(k){
      if(k.n&&String(k.n).trim()||k.k==='tap'||!k.e)return cName(k);
      const nm=flEntN(k.e)+(k.a?' · '+k.a:'');
      if(k.k==='data')return nm;
      return nm+' '+opSym(k.op)+' '+(k.v==null?'':k.v)+(k.op==='btw'?' and '+(k.v2==null?'':k.v2):'');
    }
    const flValK=k=>{if(k.k!=='data')return false;const U=cUsers(k).filter(r=>!flCv||rTgs(r).some(flPgS));return U.length>0&&U.every(rOutHid);};
    const flTg=k=>flCv&&k.k!=='tap'&&!!k.e&&(k.k==='data'||!!causeJS(k));
    const flSlW=k=>k.a?'a:'+k.a:'s';
    const flNum=x=>x!==''&&x!=null&&isFinite(+x)?+x:null;
    function flSlV(k){
      const w=flSlW(k),sv=simVal(k.e,w),v=flNum(sv!==''?sv:teReal(k.e,w));
      return v==null&&w==='a:brightness'?0:v;
    }
    function flRng(k){
      const v=flSlV(k);if(v==null)return null;
      const w=flSlW(k),a=w.slice(2),h=self._hass,st=h&&h.states&&h.states[k.e],A=st&&st.attributes||{};
      let lo=null,hi=null;
      const span=(p,q)=>{p=flNum(p);q=flNum(q);if(p==null||q==null)return;if(p>q)[p,q]=[q,p];
        if(q>p){lo=lo==null?p:Math.min(lo,p);hi=hi==null?q:Math.max(hi,q);}};
      if(w==='s'){span(A.min,A.max);if(A.unit_of_measurement==='%')span(0,100);}
      else if(a==='brightness')span(0,255);
      else if(/temp/.test(a))span(A.min_temp,A.max_temp);
      else if(/humidity/.test(a)){span(A.min_humidity,A.max_humidity);if(lo==null)span(0,100);}
      else if(/position|percentage/.test(a))span(0,100);
      else if(a==='volume_level')span(0,1);
      cUsers(k).forEach(r=>(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{
        if(isBind(x)){const I=bindIn(x);span(I[0],I[1]);}
        else if(x&&x.k==='follow'&&x.p==='opacity'&&x.map==='value')span(0,1);
      }));
      const rv=flNum(teReal(k.e,w)),b=rv!=null?rv:v;
      if(lo==null){if(b>0)span(0,2*b);else if(b<0)span(2*b,0);else span(0,100);}
      const T=[v,rv];
      CAUS().forEach(q=>{if(q.k==='cond'&&q.e===k.e&&(q.a?'a:'+q.a:'s')===w){T.push(flNum(q.v));if(q.op==='btw')T.push(flNum(q.v2));}});
      T.forEach(t=>{if(t!=null){lo=Math.min(lo,t);hi=Math.max(hi,t);}});
      const sp=w==='s'?flNum(A.step):null;
      return {lo:lo,hi:hi,st:sp>0?sp:Math.pow(10,Math.floor(Math.log10(hi-lo))-2),v:v};
    }
    const flSlT=(x,st)=>{const d=st>=1?0:Math.min(6,Math.round(-Math.log10(st)));return (+x).toFixed(d);};
    const flSlP=R=>R?clamp((R.v-R.lo)/(R.hi-R.lo)*100,0,100):50;
    function flSlPut(k,x){
      const w=flSlW(k);
      if(w==='a:brightness'&&simBri(k)){simPut(k.e,'s',+x>0?'on':'off');simPut(k.e,w,+x>0?String(x):'');}
      else simPut(k.e,w,String(x));
    }
    function flSlClr(k){simPut(k.e,k.a?'a:'+k.a:'s','');if(simBri(k)){simPut(k.e,'s','');simPut(k.e,'a:brightness','');}}
    const FL_KO={cond:0,data:1,tap:2};
    function flCauses(){
      return CAUS().filter(k=>cUsers(k).some(r=>rTgs(r).some(flPgS))).map((k,i)=>({k:k,i:i,g:FL_KO[k.k]!=null?FL_KO[k.k]:3,n:flCN(k)}))
        .sort((x,y)=>x.g-y.g||stCmp(x.n,y.n)||x.i-y.i).map(x=>x.k);
    }
    let flClkOp=false,flClkOn=false;
    const CLK_MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const clkTxt=P=>p2(P.h)+':'+p2(P.mi)+' · '+P.wd+' '+P.d+' '+CLK_MO[P.mo-1];
    function flClk(fl){
      const c=isObj(S.clk)?S.clk:null,P=clkP(c?c.t:Date.now(),clkTz()),op=flClkOp&&!fl;
      let h='<div class="fit fclk'+(c?' frc':'')+'" data-flclk="1" title="Time"><div class="row"><span class="ico">'+flSvg('clock')+'</span><span class="nm">'+esc(clkTxt(P))+'</span></div>';
      if(op)h+='<div class="fsl"><input type="range" data-flck min="0" max="1435" step="5" value="'+(P.h*60+P.mi)+'" aria-label="Time"></div>'+
        '<div class="fsl fck2"><input class="num" type="time" data-flct value="'+p2(P.h)+':'+p2(P.mi)+'" aria-label="Time">'+
        '<input class="num" type="date" data-flcd value="'+P.y+'-'+p2(P.mo)+'-'+p2(P.d)+'" aria-label="Day">'+
        '<button type="button" class="btn" data-flckp title="'+(clkPl?'Pause':'Play')+'" aria-label="'+(clkPl?'Pause':'Play')+'">'+(clkPl?'⏸\uFE0E':'▶\uFE0E')+'</button>'+
        (c?'<button type="button" class="btn" data-flckx title="Back to the real time" aria-label="Back to the real time">↺</button>':'')+'</div>';
      return h+'</div>';
    }
    function flClkT(it){
      const r=it.querySelector('[data-flck]'),d=it.querySelector('[data-flcd]'),o=it.querySelector('[data-flct]'),P=clkP(isObj(S.clk)?S.clk.t:Date.now(),clkTz());
      const x=o&&/^(\d\d):(\d\d)/.exec(o.value),m=x?Math.min(+x[1],23)*60+Math.min(+x[2],59):r?+r.value:P.h*60+P.mi,q=d&&/^\d{4}-\d\d-\d\d$/.test(d.value)?d.value.split('-').map(Number):[P.y,P.mo,P.d];
      return clkMs(q[0],q[1],q[2],Math.floor(m/60),m%60,clkTz());
    }
    function flCols(){
      if(!GM)return giro(flCols);
      if(!flCv){fnDraw();flReq();return;}
      flCheck();
      const CH=flChains(),F=flFoc,cls=key=>F?(F.k+':'+F.id===key?' hi':CH.items.has(key)?' lit':' dim'):'';
      const fl=flFolded('l'),fr=flFolded('r');
      E.fcl.classList.toggle('nar',fl);E.fcr.classList.toggle('nar',fr);flColW();
      let h='<div class="fch"><span class="t">When</span><button type="button" data-flfold="l" title="'+(fl?'Expand':'Collapse')+'" aria-label="'+(fl?'Expand':'Collapse')+'">'+(fl?'›':'‹')+'</button></div>';
      const KS=flCv?flCauses():CAUS();
      const VK=KS.filter(flValK),lit=k=>!!F&&(F.k==='c'&&F.id===k.id||CH.items.has('c:'+k.id));
      const ccl=key=>{const c=cls(key);return flCv&&c===' dim'?'':c;};
      const one=(k,vm)=>{
        const key='c:'+k.id,open=flOpen===key&&!fl,U=cUsers(k),f=k.k!=='tap'&&!!simOf(k.e),tg=flTg(k);
        let more='';
        if(open){
          const on=U.map(r=>{
            const o=flObjNames(rTgs(r)),oth=rCs(r).filter(q=>q!==k);
            return esc(o||'no target')+(oth.length?' <span class="k">('+(rOr(r)?'or ':'with ')+esc(oth.map(cName).join(', '))+')</span>':'');
          }).join(' · ');
          const w=k.a?'a:'+k.a:'s',sv=flCv&&k.k==='data'&&!!k.e;
          const box=sv?'<div class="fsim"><input class="num" type="text" data-flsim="'+esc(k.id)+'" aria-label="Value" value="'+esc(cVal(k))+'" placeholder="'+esc(teReal(k.e,w))+'" list="fsl-'+esc(k.id)+'">'+
            '<datalist id="fsl-'+esc(k.id)+'">'+teOpts(k.e,teEnts().get(k.e)||{c:[k]},w).map(x=>'<option value="'+esc(x)+'">').join('')+'</datalist>'+
            (f?'<button type="button" class="btn" data-flsimx="'+esc(k.id)+'" title="Back to the real value" aria-label="Back to the real value">↺</button>':'')+'</div>':'';
          more='<div class="more"><span class="chip">'+(k.k==='tap'?(SW_A[tapG(k)]?'swipe':'tap')+' · instant':k.k==='data'?'data · continuous':'condition · lasting')+'</span>'+
            (k.k==='tap'?'':'<span class="mono">'+esc(cText(k))+'</span>')+box+
            '<span class="k">on</span><span>'+(on||'no rules')+'</span></div>';
        }
        const R=tg&&k.k==='data'?flRng(k):null,sl=!!R&&flSl===k.id&&!fl;
        const bar=!tg?'':k.k==='data'?'<i class="fbar">'+(R?'<b style="left:'+Math.round(flSlP(R)*10)/10+'%"></b>':'')+'</i>':'<i class="fsw'+(cNow(k)?' on':'')+'"></i>';
        const sld=sl?'<div class="fsl"><input type="range" data-flsl="'+esc(k.id)+'" min="'+R.lo+'" max="'+R.hi+'" step="'+R.st+'" value="'+R.v+'" aria-label="Value">'+
          '<span class="v">'+esc(flSlT(R.v,R.st))+'</span>'+(f?'<button type="button" class="btn" data-flsimx="'+esc(k.id)+'" title="Back to the real value" aria-label="Back to the real value">↺</button>':'')+'</div>':'';
        h+='<div class="fit k-'+k.k+ccl(key)+(f?' frc':'')+(isSp(k.e)?' fph':'')+(k.k==='cond'&&cNow(k)?' now':'')+(tg?' ftg':'')+(vm?' fvm':'')+'" data-fk="'+esc(key)+'" title="'+esc(cName(k))+'">'+
          '<div class="row"><span class="ico'+(bar?' fb':'')+'"'+(tg?' data-fltg="1" title="'+(k.k==='data'?(R?'Slide the value':'Test value'):cNow(k)?'Test as false':'Test as true')+'"':'')+'>'+flIco(k)+bar+'</span><span class="nm">'+esc(flCN(k))+'</span></div>'+sld+more+'</div>';
      };
      const TK=flCv?KS.filter(k=>k.k==='tap'):[];
      const TR=[].concat(...TK.map(cUsers)).filter(r=>rTgs(r).some(flPgS)).sort((a,b)=>stCmp(rName(a),rName(b)));
      if(flCv)h+=flClk(fl);
      KS.forEach(k=>{if(!flValK(k)&&TK.indexOf(k)<0)one(k,false);});
      if(VK.length){
        h+='<div class="fit k-data fvg'+(F&&!flCv&&!VK.some(lit)?' dim':'')+'" data-flval="1" title="Values on labels"><div class="row"><span class="ico">'+flSvg('text')+'</span>'+
          '<span class="nm">'+(flVal?'▾':'▸')+' Values · '+VK.length+'</span></div></div>';
        VK.forEach(k=>{if(flVal||lit(k))one(k,true);});
      }
      if(TR.length){
        const tk='c:'+TK[0].id;
        h+='<div class="fit k-tap fvg'+ccl(tk)+'" data-fltap="1" title="Taps"><div class="row"><span class="ico">'+flSvg('hand')+'</span>'+
          '<span class="nm">'+(flTap?'▾':'▸')+' Taps · '+TR.length+'</span></div></div>';
        TR.forEach(r=>{
          const on=!!F&&F.k==='r'&&F.id===r.id;
          if(flTap||on)h+='<div class="fit k-tap fvm'+(on?' hi':'')+'" data-fltr="'+esc(r.id)+'" title="'+esc(rName(r))+'"><div class="row"><span class="ico">'+flSvg('hand')+'</span>'+
            '<span class="nm">'+esc((SW_A[rGest(r)]?SW_A[rGest(r)]+' ':'')+rName(r))+'</span></div></div>';
        });
      }
      if(!flCv)h+='<button type="button" class="fghost" data-fla="newc" title="New cause">+ <span>cause</span></button>';
      const fi=root.activeElement;
      if(fi&&fi.matches&&fi.matches('[data-flsim]')&&E.fcl.contains(fi))fi.addEventListener('blur',()=>{if(flow)flCols();},{once:true});
      else if(!flSlOn&&!flClkOn)put(E.fcl,h);
      let g='<div class="fch"><button type="button" data-flfold="r" title="'+(fr?'Expand':'Collapse')+'" aria-label="'+(fr?'Expand':'Collapse')+'">'+(fr?'‹':'›')+'</button><span class="t">Then</span></div>';
      flEffOrd().forEach(q=>{
        const key='x:'+q.key,open=flOpen===key&&!fr,x=q.fx;
        const lb=q.s||null,xs=x.k==='follow'&&x.p==='text'?lb:undefined;
        let more='';
        if(open){
          const O=[];q.rules.forEach(r=>rTgs(r).forEach(s=>{if(O.indexOf(s)<0)O.push(s);}));
          more='<div class="more"><div class="big">'+fxThumb(x,lb)+'</div><span>'+esc(fxDesc(x))+'</span>'+
            (q.pend?'<span class="k">not used yet: drag the dot of a row here</span>':'<span class="k">used by '+O.length+(O.length===1?' object':' objects')+': '+esc(flObjNames(O))+'</span>')+
            '<div class="acts">'+q.rules.map(r=>'<button type="button" class="btn" data-flopen="'+r.id+'" title="Edit the rule">'+esc(rName(r))+'</button>').join('')+
            (q.pend?'<button type="button" class="btn" data-fla="drop">Remove</button>':'')+'</div></div>';
        }
        g+='<div class="fit'+cls(key)+(q.pend?' pend':'')+'" data-fk="'+esc(key)+'" title="'+esc(fxLabel(x,xs))+'"><span class="port"></span>'+
          '<div class="row"><span class="th">'+fxThumb(x,lb)+'</span><span class="nm">'+esc(fxLabel(x,xs))+'</span></div>'+more+'</div>';
      });
      g+='<button type="button" class="fghost" data-fla="newx" title="New effect">+ <span>effect</span></button>';
      put(E.fcr,g);
      flReq();
    }

    const FN={H:20,GAP:12,CG:46,PAD:12,HEAD:26,SUB:22,FG:40,BAND:34,MAXW:2600,TW:300};
    const FN_C={cond:'#a6bbcf',data:'#e2d96e',tap:'#c7a6e0',look:'#87d4a9',sym:'#87d4a9',pho:'#7fd0d8',follow:'#fdd0a2',act:'#f3b567'};
    const FN_AG={spin:'↻',beat:'♥',pulse:'◉',blink:'✦'};
    let fnV=null,fnL=null,fnQ='',fnCyc=0,fnHv='',fnCx=null,fnFont='';
    function fnPlace(id){
      if(bgOf(id))return {top:'~bg',sub:''};
      const G=grpOf(id),s=G?null:objOf(id);
      if(!G&&!s)return null;
      const ch=G?chainG(id):chainOf(s);
      if(!ch.length)return {top:'~free',sub:''};
      return {top:ch[ch.length-1],sub:ch.length>1?ch[ch.length-2]:''};
    }
    const fnXK=x=>x.k==='follow'&&x.p==='text'?'tx:'+[x.dec==null?'':x.dec,x.pre||'',x.suf||''].join('|'):fxKey(x);
    function fnModel(){
      const F=new Map();
      const sub=p=>{
        let T=F.get(p.top);if(!T){T={top:p.top,subs:new Map()};F.set(p.top,T);}
        let U=T.subs.get(p.sub);if(!U){U={top:p.top,sub:p.sub,c:new Map(),o:new Map(),x:new Map(),l:new Map()};T.subs.set(p.sub,U);}
        return U;
      };
      const add=(L,v)=>{if(L.indexOf(v)<0)L.push(v);};
      const link=(U,a,b,r,cs)=>{const k=a+'>'+b;let L=U.l.get(k);if(!L){L={a:a,b:b,r:[],c:[]};U.l.set(k,L);}add(L.r,r.id);cs.forEach(c=>add(L.c,c));};
      RULS().forEach(r=>{
        const K=rCs(r),cs=K.map(k=>k.id),X=(Array.isArray(r.fx)?r.fx:[]).filter(x=>x&&!fxVoid(x));
        rOn(r).forEach(t=>{
          const p=fnPlace(t);if(!p)return;
          const U=sub(p),on='o:'+t;
          if(!U.o.has(on))U.o.set(on,{id:on,t:t,c:[],r:[]});
          const O=U.o.get(on);add(O.r,r.id);
          K.forEach(k=>{
            const cn='c:'+k.id;if(!U.c.has(cn))U.c.set(cn,{id:cn,k:k,r:[]});
            add(U.c.get(cn).r,r.id);add(O.c,k.id);link(U,cn,on,r,[k.id]);
          });
          X.forEach(x=>{
            const xn='x:'+cs.join(',')+'|'+fnXK(x);
            if(!U.x.has(xn))U.x.set(xn,{id:xn,x:x,c:cs.slice(),r:[]});
            add(U.x.get(xn).r,r.id);link(U,on,xn,r,cs);
          });
        });
      });
      return F;
    }
    function fnTab(x,y,w,h,t,tw,r){
      tw=Math.min(Math.ceil(tw),w);const q=4;
      return 'M'+f(x)+' '+f(y+q)+'A'+q+' '+q+' 0 0 1 '+f(x+q)+' '+f(y)+'H'+f(x+tw-q)+'A'+q+' '+q+' 0 0 1 '+f(x+tw)+' '+f(y+q)+'V'+f(y+t)+
        'H'+f(x+w-r)+'A'+r+' '+r+' 0 0 1 '+f(x+w)+' '+f(y+t+r)+'V'+f(y+h-r)+'A'+r+' '+r+' 0 0 1 '+f(x+w-r)+' '+f(y+h)+'H'+f(x+r)+'A'+r+' '+r+' 0 0 1 '+f(x)+' '+f(y+h-r)+'Z';
    }
    const fnBox=(x,y,w,h)=>' x="'+f(x)+'" y="'+f(y)+'" width="'+f(w)+'" height="'+f(h)+'"';
    function fnTW(t){
      if(fnCx==null){try{fnCx=document.createElement('canvas').getContext('2d')||false;}catch(_){fnCx=false;}}
      if(!fnCx)return Math.ceil(String(t).length*6.2);
      if(!fnFont){fnFont='11px '+(getComputedStyle(E.fnw).fontFamily||'sans-serif');}
      fnCx.font=fnFont;return Math.ceil(fnCx.measureText(t).width);
    }
    function fnCut(t){if(fnTW(t)<=FN.TW)return t;let a=0,b=t.length;while(a<b){const m=(a+b+1)>>1;if(fnTW(t.slice(0,m)+'…')<=FN.TW)a=m;else b=m-1;}return t.slice(0,a)+'…';}
    const fnTop=top=>top==='~bg'?'Background layers':top==='~free'?'Ungrouped':((grpOf(top)||{}).n||'(unnamed)');
    const fnTgN=t=>{const o=tgtOf(t);return o?(o.n||(bgOf(t)?'Layer':o.id)):t;};
    function fnXL(x){if(x.k==='look'){const L=idsStys(x.sty);return L.map(q=>q.n||'(unnamed)').join(' + ');}return fxLabel(x);}
    const fnSty=x=>x.k==='look'||x.k==='act'&&actA(x)==='sty'?idsStys(x.sty):x.k==='mv'?idsStys(x.mo):[];
    function fnPg(t){
      if(!hasPgs()||bgOf(t))return '';
      const s=objOf(t);if(s)return s.pg||'';
      const P=new Set(S.objects.filter(q=>inG(q,t)).map(q=>q.pg||''));
      return P.size===1?[...P][0]:'';
    }
    function fnSub(U){
      const H=FN.H,G=FN.GAP,C=[...U.c.values()],O=[...U.o.values()],X=[...U.x.values()];
      C.forEach(n=>{n.l=fnCut(flCN(n.k));n.w=fnTW(n.l)+34;});
      O.forEach(n=>{n.l=fnCut(fnTgN(n.t));n.w=fnTW(n.l)+34;});
      X.forEach(n=>{n.l=fnCut(fnXL(n.x));n.sw=fnSty(n.x);n.w=fnTW(n.l)+34+n.sw.length*17;});
      const w0=C.length?Math.max(50,...C.map(n=>n.w)):0,w1=Math.max(60,...O.map(n=>n.w)),w2=X.length?Math.max(60,...X.map(n=>n.w)):0;
      const x1=C.length?w0+FN.CG:0,x2=x1+w1+FN.CG;
      const place=L=>{L.sort((a,b)=>a.want-b.want);let p=-1e9;L.forEach(n=>{n.y=Math.max(n.want,p+H+G);p=n.y;});};
      const ci=new Map(C.map((n,i)=>[n.k.id,i]));
      O.forEach((o,i)=>{o.want=(o.c.length?Math.min(...o.c.map(c=>ci.get(c))):C.length)*100+i;});
      for(let it=0;it<3;it++){
        O.sort((a,b)=>a.want-b.want);O.forEach((o,i)=>{o.y=i*(H+G);});
        C.forEach(n=>{const ys=O.filter(o=>o.c.indexOf(n.k.id)>=0).map(o=>o.y);n.want=ys.length?ys.reduce((a,b)=>a+b,0)/ys.length:0;});
        place(C);
        O.forEach(o=>{o.want=(o.c.length?o.c.reduce((a,c)=>a+U.c.get('c:'+c).y,0)/o.c.length:1e6)+o.y*.001;});
      }
      const oy=new Map(O.map(o=>[o.id,o.y])),L=[...U.l.values()];
      X.forEach(x=>{const ys=L.filter(l=>l.b===x.id).map(l=>oy.get(l.a));x.want=ys.reduce((a,b)=>a+b,0)/ys.length;});
      place(X);
      const cols=[C,O,X].filter(L=>L.length),T=Math.max(...cols.map(L=>L.length))*(H+G)-G;
      cols.forEach(L=>{L.sort((a,b)=>a.y-b.y);const st=(T+G)/L.length;L.forEach((n,i)=>{n.y=i*st+(st-G-H)/2;});});
      C.forEach(n=>{n.px=0;n.w=w0;});O.forEach(n=>{n.px=x1;n.w=w1;});X.forEach(n=>{n.px=x2;n.w=w2;});
      const all=C.concat(O,X);
      U.w=X.length?x2+w2:x1+w1;U.h=Math.max(...all.map(n=>n.y))+H;U.nodes=all;
    }
    function fnLayout(){
      const M=fnModel(),flows=[];
      M.forEach(T=>{
        const subs=[...T.subs.values()];subs.forEach(fnSub);
        const P=new Set();subs.forEach(U=>U.o.forEach(o=>P.add(fnPg(o.t))));
        const fl={top:T.top,t:fnTop(T.top),subs:subs,pg:P.size===1?[...P][0]:''};
        if(subs.length===1){const U=subs[0];U.ox=FN.PAD;U.oy=FN.HEAD;U.fr=null;fl.w=U.w+2*FN.PAD;fl.h=FN.HEAD+U.h+FN.PAD;}
        else{
          subs.sort((a,b)=>b.h-a.h);
          const nc=subs.length>2?2:1,ch=Array(nc).fill(FN.HEAD),cw=Array(nc).fill(0),col=[];
          subs.forEach(U=>{const i=ch.indexOf(Math.min(...ch));col.push([U,i,ch[i]]);ch[i]+=FN.SUB+U.h+10+12;cw[i]=Math.max(cw[i],U.w+2*FN.PAD);});
          const cx=[FN.PAD];for(let i=1;i<nc;i++)cx[i]=cx[i-1]+cw[i-1]+14;
          col.forEach(([U,i,y])=>{U.fr={x:cx[i],y:y,w:cw[i],h:FN.SUB+U.h+10,t:U.sub?((grpOf(U.sub)||{}).n||'(unnamed)'):fl.t};U.ox=cx[i]+FN.PAD;U.oy=y+FN.SUB;});
          fl.w=cx[nc-1]+cw[nc-1]+FN.PAD;fl.h=Math.max(...ch)-12+FN.PAD;
        }
        flows.push(fl);
      });
      const bands=[];
      if(hasPgs()){PGS().forEach(p=>bands.push({id:p.id,t:pgName(p)}));bands.push({id:'',t:'All pages'});}
      else bands.push({id:'',t:''});
      let y=0,W=0;const out=[];
      bands.forEach(b=>{
        const L=flows.filter(f=>f.pg===b.id||!bands.some(q=>q.id===f.pg)&&b.id==='');if(!L.length)return;
        if(b.t){out.push({k:'b',t:b.t,y:y});y+=FN.BAND;}
        let x=0,rh=0,n=0;
        L.forEach(f=>{if(x>0&&(n>=2||x+f.w>FN.MAXW)){x=0;y+=rh+FN.FG;rh=0;n=0;}f.x=x;f.y=y;x+=f.w+FN.FG;n++;rh=Math.max(rh,f.h);W=Math.max(W,f.x+f.w);});
        y+=rh+FN.FG+10;
      });
      out.forEach(b=>b.w=W);
      return {flows:flows,bands:out,w:Math.max(W,1),h:Math.max(y-FN.FG-10,1)};
    }
    const fnIc=h=>h.replace('<svg ','<svg class="gl" x="4" y="4" width="12" height="12" ');
    function fnXI(x){
      if(x.k==='look'||x.k==='sym'||x.k==='mv')return fnIc(flSvg('star'));
      if(x.k==='pho')return fnIc(flSvg('photo'));
      if(x.k==='act')return fnIc(flSvg(actA(x)==='page'?'flag':actA(x)==='nav'?'nav':actA(x)==='info'?'info':'sw'));
      if(x.k==='follow'&&x.p==='text')return fnIc(flSvg('text'));
      return fnIc(flSvg('gauge'));
    }
    function fnOI(t){
      if(bgOf(t))return fnIc(flSvg('photo'));
      if(grpOf(t))return fnIc('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 3"/></svg>');
      const s=objOf(t);if(!s)return '';
      if(s.t==='icon'){const d=iconPath(s.icon);if(d)return '<svg class="gl" x="4" y="4" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="'+d+'"/></svg>';return fnIc(flSvg('star'));}
      if(s.t==='label')return fnIc(flSvg('text'));
      return fnIc(flSvg('zone'));
    }
    function fnSw(st,x){
      if(isAn(st)){const a=st.anim||'',g=FN_AG[a]||'▶';
        return '<g transform="translate('+x+',5)"><rect width="10" height="10" rx="2.5" fill="#fff" stroke="#555" stroke-width=".7"/><text class="ag '+(FN_AG[a]?a:'any')+'" x="5" y="5.5" font-size="8.5" text-anchor="middle">'+g+'</text></g>';}
      return '<svg x="'+x+'" y="5" width="15" height="10" viewBox="0 0 30 20"><rect width="30" height="20" rx="4" fill="url(#fn-chk)"/>'+stMini(st,'n','fn'+st.id,st.id)+'</svg>';
    }
    const fnD=L=>' '+L.map(esc).join(' ')+' ';
    const fnEsc=v=>typeof CSS!=='undefined'&&CSS.escape?CSS.escape(v):String(v).replace(/["\\]/g,'\\$&');
    function fnNode(n,kind,ox,oy,uk){
      const H=FN.H,x=f(ox+n.px),y=f(oy+n.y);
      let cl='n',fill='',ic='',sw='',dc=[],tt=n.l;
      if(kind==='c'){cl+=' c';fill=FN_C[n.k.k]||FN_C.cond;ic=fnIc(flIco(n.k));dc=[n.k.id];tt=cName(n.k);}
      else if(kind==='o'){cl+=' o';ic=fnOI(n.t);dc=n.c;}
      else{cl+=' x';fill=FN_C[n.x.k]||FN_C.act;ic=fnXI(n.x);dc=n.c;n.sw.forEach((st,i)=>{sw+=fnSw(st,24+i*17);});tt=fxLabel(n.x);}
      n.ax=ox+n.px;n.ay=oy+n.y;
      const tx=24+(kind==='x'?n.sw.length*17:0);
      return '<g class="'+cl+'" data-n="'+esc(n.id)+'" data-u="'+esc(uk)+'" data-c="'+fnD(dc)+'" data-r="'+fnD(n.r)+'" transform="translate('+x+','+y+')"><title>'+esc(tt)+'</title>'+
        '<rect class="b" width="'+n.w+'" height="'+H+'" rx="4"'+(fill?' fill="'+fill+'"':'')+'/>'+
        '<path class="ib" d="M0 4a4 4 0 0 1 4-4h14v'+H+'H4a4 4 0 0 1-4-4z"/><line class="il" x1="18" y1="0" x2="18" y2="'+H+'"/>'+ic+sw+
        '<text x="'+tx+'" y="'+(H/2)+'">'+esc(n.l)+'</text>'+
        (kind!=='c'?'<rect class="pt" x="-4" y="'+(H/2-4)+'" width="8" height="8" rx="2"/>':'')+
        (kind!=='x'?'<rect class="pt" x="'+(n.w-4)+'" y="'+(H/2-4)+'" width="8" height="8" rx="2"/>':'')+'</g>';
    }
    function fnDraw(){
      if(!GM)return giro(fnDraw);
      const F0=flFoc;
      if(F0&&!(F0.k==='c'?causeOf(F0.id):F0.k==='r'?ruleOf(F0.id):F0.k==='o'?tgtOf(F0.id):true))flFoc=null;
      const L=fnL=fnLayout(),H=FN.H;
      let h='',wi='',nd='';
      L.bands.forEach((b,i)=>{
        if(i)h+='<line class="fpd" x1="-20" y1="'+f(b.y-(FN.FG+10)/2)+'" x2="'+f(b.w+20)+'" y2="'+f(b.y-(FN.FG+10)/2)+'"/>';
        h+='<text class="fb" x="0" y="'+f(b.y+12)+'">'+esc(b.t)+'</text>';
      });
      L.flows.forEach(fl=>{
        h+='<path class="fr" data-fl="'+esc(fl.top)+'"'+fnBox(fl.x,fl.y,fl.w,fl.h)+' d="'+fnTab(fl.x,fl.y,fl.w,fl.h,17,fnTW(fl.t)*1.18+20,6)+'"/><text class="ft" x="'+f(fl.x+10)+'" y="'+f(fl.y+9)+'">'+esc(fl.t)+'</text>';
        fl.subs.forEach(U=>{
          if(U.fr)h+='<path class="fs"'+fnBox(fl.x+U.fr.x,fl.y+U.fr.y,U.fr.w,U.fr.h)+' d="'+fnTab(fl.x+U.fr.x,fl.y+U.fr.y,U.fr.w,U.fr.h,15,fnTW(U.fr.t)*1.04+16,5)+'"/><text class="fst" x="'+f(fl.x+U.fr.x+8)+'" y="'+f(fl.y+U.fr.y+8)+'">'+esc(U.fr.t)+'</text>';
          const ox=fl.x+U.ox,oy=fl.y+U.oy;
          const uk=U.top+'|'+U.sub;
          U.c.forEach(n=>{nd+=fnNode(n,'c',ox,oy,uk);});U.o.forEach(n=>{nd+=fnNode(n,'o',ox,oy,uk);});U.x.forEach(n=>{nd+=fnNode(n,'x',ox,oy,uk);});
          U.l.forEach(l=>{
            const a=U.c.get(l.a)||U.o.get(l.a),b=U.o.get(l.b)||U.x.get(l.b);if(!a||!b)return;
            const x0=a.ax+a.w,y0=a.ay+H/2,x1=b.ax,y1=b.ay+H/2,dx=Math.max(30,Math.abs(x1-x0)/2);
            const d='M'+f(x0)+' '+f(y0)+'C'+f(x0+dx)+' '+f(y0)+' '+f(x1-dx)+' '+f(y1)+' '+f(x1)+' '+f(y1);
            const at=' data-u="'+esc(uk)+'" data-a="'+esc(l.a)+'" data-b="'+esc(l.b)+'" data-c="'+fnD(l.c)+'" data-r="'+fnD(l.r)+'" d="'+d+'"';
            wi+='<path class="w"'+at+'/><path class="wh"'+at+'/>';
          });
        });
      });
      put(E.fnv,h+wi+nd);
      let m='';L.flows.forEach(fl=>{m+='<rect class="m" data-fl="'+esc(fl.top)+'" x="'+f(fl.x)+'" y="'+f(fl.y)+'" width="'+f(fl.w)+'" height="'+f(fl.h)+'"/>';});
      put(E.fnm,'<g id="fnmg">'+m+'</g><rect class="vp" id="fnvp"/>');
      fnList();
      if(!fnV)fnFitV();
      fnApply();fnMark();
    }
    const fnFlowsOf=id=>fnL?fnL.flows.filter(fl=>fl.subs.some(U=>U.c.has('c:'+id))):[];
    function fnList(){
      const q=fnQ.trim().toLowerCase(),hit=t=>!q||String(t||'').toLowerCase().indexOf(q)>=0;
      let h='<div class="sh">Flows · '+fnL.flows.length+'</div>';
      fnL.flows.forEach(fl=>{
        const sn=fl.subs.filter(U=>U.fr&&U.sub).map(U=>U.fr.t),pg=fl.pg?pgName(pgOf(fl.pg)):hasPgs()?'All pages':'';
        const ok=hit(fl.t)||sn.some(hit)||fl.subs.some(U=>[...U.o.values()].some(o=>hit(o.l))||[...U.c.values()].some(c=>hit(c.l)||hit(c.k.e)));
        if(!ok)return;
        h+='<div class="it" role="listitem" data-fnf="'+esc(fl.top)+'"><span class="t"><b>'+esc(fl.t)+'</b><i>'+esc(sn.join(' · ')||pg)+'</i></span></div>';
      });
      const K=CAUS().map(k=>({k:k,n:fnFlowsOf(k.id).length,l:flCN(k)})).filter(c=>hit(c.l)||hit(c.k.e)||hit(cName(c.k)));
      K.sort((a,b)=>b.n-a.n||a.l.localeCompare(b.l));
      h+='<div class="sh">Causes · '+K.length+'</div>';
      K.forEach(c=>{h+='<div class="it'+(c.n?'':' off')+(c.k.k!=='tap'&&simOf(c.k.e)?' sim':'')+(isSp(c.k.e)?' ph':'')+'" role="listitem" data-fnc="'+esc(c.k.id)+'" title="'+esc(cName(c.k))+'"><span class="t"><b>'+esc(c.l)+'</b></span><em>'+c.n+'</em></div>';});
      put(E.fnls,h);
    }
    function fnApply(){
      if(!fnV||!fnL)return;
      const V=fnV;E.fnv.setAttribute('transform','translate('+f(V.x)+','+f(V.y)+') scale('+f(V.z)+')');
      E.fnc.style.backgroundSize=f(20*V.z)+'px '+f(20*V.z)+'px';E.fnc.style.backgroundPosition=f(V.x)+'px '+f(V.y)+'px';
      E.fnzl.textContent=Math.round(V.z*100)+'%';
      const L=fnL,k=Math.min(180/L.w,140/L.h),cw=E.fnc.clientWidth,chh=E.fnc.clientHeight;
      E.fnm.setAttribute('viewBox','0 0 '+f(L.w)+' '+f(L.h));E.fnm.style.width=f(L.w*k)+'px';E.fnm.style.height=f(L.h*k)+'px';
      const vp=E.fnm.querySelector('#fnvp');
      if(vp){vp.setAttribute('x',f(-V.x/V.z));vp.setAttribute('y',f(-V.y/V.z));vp.setAttribute('width',f(cw/V.z));vp.setAttribute('height',f(chh/V.z));}
    }
    function fnFitV(){
      const cw=E.fnc.clientWidth,ch=E.fnc.clientHeight;if(!fnL||cw<10||ch<10){fnV=null;return;}
      const z=clamp(Math.min((cw-40)/fnL.w,(ch-40)/fnL.h),.1,1);
      fnV={z:z,x:Math.max(20,(cw-fnL.w*z)/2),y:20};
    }
    function fnZoom(k,cx,cy){
      if(!fnV)return;
      const z=clamp(fnV.z*k,.1,2.5);if(cx==null){cx=E.fnc.clientWidth/2;cy=E.fnc.clientHeight/2;}
      fnV.x=cx-(cx-fnV.x)*z/fnV.z;fnV.y=cy-(cy-fnV.y)*z/fnV.z;fnV.z=z;fnApply();
    }
    function fnGo(r){
      if(!fnV)return;
      const cw=E.fnc.clientWidth,ch=E.fnc.clientHeight,fit=Math.min((cw-40)/r.w,(ch-40)/r.h);
      const z=clamp(Math.min(fnV.z<.5?.85:fnV.z,Math.max(fit,.35)),.1,2.5);
      fnV={z:z,x:r.w*z<cw-40?(cw-r.w*z)/2-r.x*z:20-r.x*z,y:r.h*z<ch-40?(ch-r.h*z)/2-r.y*z:20-r.y*z};
      fnApply();
    }
    const fnFl=top=>fnL&&fnL.flows.find(fl=>fl.top===top);
    const fnSubOf=u=>{let R=null;if(fnL)fnL.flows.some(fl=>fl.subs.some(U=>{if(U.top+'|'+U.sub===u){R=U;return true;}return false;}));return R;};
    function fnMark(){
      const W=E.fnw,F=flFoc,sel=(cls,F)=>{
        W.querySelectorAll('.'+cls).forEach(n=>n.classList.remove(cls));
        if(!F)return [];
        const q=fnEsc(F.id);let L=[];
        if(F.k==='c')L=W.querySelectorAll('[data-c~="'+q+'"]');
        else if(F.k==='r')L=W.querySelectorAll('[data-r~="'+q+'"]');
        else if(F.k==='x'&&F.u!=null){
          const U=fnSubOf(F.u),X=U&&U.x.get(F.id);
          if(X){
            const O=new Set([...U.l.values()].filter(l=>l.b===F.id).map(l=>l.a)),C=new Set(X.c.map(c=>'c:'+c));
            const N=new Set([F.id,...O,...C]);
            L=[...W.querySelectorAll('[data-u="'+fnEsc(F.u)+'"]')].filter(n=>n.dataset.n?N.has(n.dataset.n):n.dataset.b===F.id&&O.has(n.dataset.a)||O.has(n.dataset.b)&&C.has(n.dataset.a));
          }
        }
        else{const n=(F.k==='o'?'o:':'')+F.id,e=fnEsc(n);L=W.querySelectorAll('[data-n="'+e+'"],[data-a="'+e+'"],[data-b="'+e+'"]');}
        L.forEach(n=>{if(!n.classList.contains('wh'))n.classList.add(cls);});
        return L;
      };
      W.querySelectorAll('.sim').forEach(n=>n.classList.remove('sim'));
      CAUS().forEach(k=>{if(k.k==='tap'||!simOf(k.e))return;W.querySelectorAll('[data-c~="'+fnEsc(k.id)+'"]').forEach(n=>{if(!n.classList.contains('wh'))n.classList.add('sim');});});
      const on=sel('on',F);sel('hv',fnHv?{k:'c',id:fnHv}:null);
      const tops=new Set();
      if(fnL&&on.length)fnL.flows.forEach(fl=>{if(fl.subs.some(U=>[...U.c.keys(),...U.o.keys(),...U.x.keys()].some(id=>W.querySelector('.n.on[data-n="'+fnEsc(id)+'"]'))))tops.add(fl.top);});
      W.querySelectorAll('.fr').forEach(r=>r.classList.toggle('lit',tops.has(r.dataset.fl)));
      E.fnm.querySelectorAll('.m').forEach(r=>r.classList.toggle('lit',tops.has(r.dataset.fl)));
      E.fnls.querySelectorAll('[data-fnf]').forEach(n=>n.classList.toggle('lit',tops.has(n.dataset.fnf)));
      E.fnls.querySelectorAll('[data-fnc]').forEach(n=>n.classList.toggle('on',!!F&&F.k==='c'&&F.id===n.dataset.fnc));
    }
    function fnPickN(n){
      const id=n.dataset.n,k=id.slice(0,2),v=id.slice(2);
      if(k==='c:'){fnCyc=0;flFocus(flFoc&&flFoc.k==='c'&&flFoc.id===v?null:{k:'c',id:v});return;}
      if(k==='o:'){
        if(flFoc&&flFoc.k==='o'&&flFoc.id===v){flFocus(null);return;}
        if(grpOf(v)){pickG(S.objects.filter(s=>inG(s,v)),v);selRu=false;selTe=false;selSt=false;selBg=false;selG=-1;lastShown='';flFoc={k:'o',id:v};flMenu=null;flPanel=true;render();return;}
        flFocus({k:'o',id:v});return;
      }
      const u=n.dataset.u,U=fnSubOf(u),X=U&&U.x.get(id);if(!X)return;
      const st=fnSty(X.x)[0];
      if(X.x.k==='look'&&st){stCur=st.id;stGrpCur='';stAn=isAn(st);stMs=ms.slice();selSt=true;selRu=false;selTe=false;selBg=false;selG=-1;lastShown='';flFoc={k:'x',id:id,u:u};flMenu=null;flPanel=true;render();return;}
      if(X.r.length){flFocus({k:'r',id:X.r[0]});flFoc={k:'x',id:id,u:u};fnMark();}
    }
    {
      let D=null;const P=new Map();
      const pt=e=>{const R=E.fnc.getBoundingClientRect();return [e.clientX-R.left,e.clientY-R.top];};
      E.fnc.addEventListener('pointerdown',e=>{
        if(e.target.closest('.fnz,#fnm')||e.pointerType==='mouse'&&e.button!==0)return;
        e.preventDefault();
        P.set(e.pointerId,pt(e));
        if(P.size===1)D={t:e.target,s:pt(e),v:fnV&&Object.assign({},fnV),mv:false};
        else if(P.size===2&&fnV){const [a,b]=[...P.values()];D={pinch:true,d:Math.hypot(a[0]-b[0],a[1]-b[1]),m:[(a[0]+b[0])/2,(a[1]+b[1])/2],v:Object.assign({},fnV),mv:true};}
        try{E.fnc.setPointerCapture(e.pointerId);}catch(_){}
      });
      E.fnc.addEventListener('pointermove',e=>{
        if(!P.has(e.pointerId)||!D||!fnV)return;
        P.set(e.pointerId,pt(e));
        if(D.pinch&&P.size>=2){
          const [a,b]=[...P.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),m=[(a[0]+b[0])/2,(a[1]+b[1])/2],z=clamp(D.v.z*d/Math.max(1,D.d),.1,2.5);
          fnV={z:z,x:m[0]-(D.m[0]-D.v.x)*z/D.v.z,y:m[1]-(D.m[1]-D.v.y)*z/D.v.z};fnApply();return;
        }
        const p=pt(e),dx=p[0]-D.s[0],dy=p[1]-D.s[1];
        if(!D.mv&&Math.hypot(dx,dy)>4){D.mv=true;E.fnc.classList.add('pan');}
        if(D.mv&&D.v){fnV.x=D.v.x+dx;fnV.y=D.v.y+dy;fnApply();}
      });
      const up=e=>{
        if(!P.has(e.pointerId))return;
        P.delete(e.pointerId);E.fnc.classList.remove('pan');
        if(P.size||!D)return;
        const d=D;D=null;if(d.mv||e.type==='pointercancel')return;
        const n=d.t.closest&&d.t.closest('#fnw .n'),w=d.t.closest&&d.t.closest('#fnw .wh');
        if(n)fnPickN(n);
        else if(w){const r=w.dataset.r.trim().split(' ')[0];if(r)flFocus({k:'r',id:r});}
        else if(flFoc||flPanel){flPanel=false;flFocus(null);}
      };
      E.fnc.addEventListener('pointerup',up);E.fnc.addEventListener('pointercancel',up);
      E.fnc.addEventListener('wheel',e=>{
        if(!fnV)return;e.preventDefault();
        const p=pt(e);
        const dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?400:1);
        fnZoom(Math.exp(-dy*(e.ctrlKey||e.metaKey?.01:.002)),p[0],p[1]);
      },{passive:false});
      E.fnw.addEventListener('pointerover',e=>{
        if(e.pointerType!=='mouse')return;
        const n=e.target.closest('.n.c'),id=n?n.dataset.n.slice(2):'';
        if(id!==fnHv){fnHv=id;fnMark();}
      });
      E.fnw.addEventListener('pointerleave',()=>{if(fnHv){fnHv='';fnMark();}});
      E.fnet.querySelector('.fnz').addEventListener('click',e=>{
        const b=e.target.closest('[data-fnz]');if(!b||!fnV)return;const k=b.dataset.fnz;
        if(k==='fit'){fnFitV();fnApply();}else if(k==='1')fnZoom(1/fnV.z);else fnZoom(k==='+'?1.25:.8);
      });
      let mm=false;
      const mGo=e=>{if(!fnV||!fnL)return;const R=E.fnm.getBoundingClientRect(),wx=(e.clientX-R.left)/R.width*fnL.w,wy=(e.clientY-R.top)/R.height*fnL.h;
        fnV.x=E.fnc.clientWidth/2-wx*fnV.z;fnV.y=E.fnc.clientHeight/2-wy*fnV.z;fnApply();};
      E.fnm.addEventListener('pointerdown',e=>{mm=true;try{E.fnm.setPointerCapture(e.pointerId);}catch(_){}mGo(e);e.stopPropagation();});
      E.fnm.addEventListener('pointermove',e=>{if(mm)mGo(e);});
      E.fnm.addEventListener('pointerup',()=>{mm=false;});E.fnm.addEventListener('pointercancel',()=>{mm=false;});
      E.fnls.addEventListener('click',e=>{
        const a=e.target.closest('[data-fnf]'),c=e.target.closest('[data-fnc]');
        if(a){const fl=fnFl(a.dataset.fnf);if(fl)fnGo(fl);return;}
        if(!c)return;
        const id=c.dataset.fnc,L=fnFlowsOf(id);
        if(flFoc&&flFoc.k==='c'&&flFoc.id===id)fnCyc=L.length?(fnCyc+1)%L.length:0;else{fnCyc=0;flFocus({k:'c',id:id});}
        if(L.length)fnGo(fnFlowsOf(id)[fnCyc]||L[0]);
      });
      E.fnq.addEventListener('input',()=>{fnQ=E.fnq.value;fnList();fnMark();});
    }

    function flReq(){if(flow&&!flRaf)flRaf=requestAnimationFrame(flDraw);}
    function flRoute(x0,y0,T,x1,y1){
      const dy=y1-y0;if(Math.abs(dy)<1)return 'M'+f(x0)+' '+f(y0)+'H'+f(x1);
      const s=Math.sign(dy),r=Math.max(0,Math.min(12,Math.abs(dy)/2,T-x0,x1-T));
      return 'M'+f(x0)+' '+f(y0)+'H'+f(T-r)+'Q'+f(T)+' '+f(y0)+' '+f(T)+' '+f(y0+s*r)+'V'+f(y1-s*r)+'Q'+f(T)+' '+f(y1)+' '+f(T+r)+' '+f(y1)+'H'+f(x1);
    }
    function flBend(x0,y0,T,x1,y1){const dy=y1-y0;return Math.abs(dy)<1?0:Math.sign(dy)*Math.max(0,Math.min(12,Math.abs(dy)/2,T-x0,x1-T));}
    function flItem(key){if(key[0]==='x'&&E.fcr.hidden)return null;return [...E.fcl.children,...E.fcr.children].find(n=>n.dataset&&n.dataset.fk===key)||null;}
    function flDraw(){
      if(!GM)return giro(flDraw);
      flRaf=0;
      if(!flow){put(E.flw,'');put(E.flv,'');E.fmenu.hidden=true;return;}
      if(!flCv){put(E.flw,'');put(E.flv,'');E.fmenu.hidden=true;if(fnL&&!fnV)fnFitV();fnApply();return;}
      flCheck();
      const W=E.wk.getBoundingClientRect(),C=cv.getBoundingClientRect(),St=stage.getBoundingClientRect();
      const ox=C.left-W.left,oy=C.top-W.top,zm=zoom,toB=(x,y)=>[ox+x*zm,oy+y*zm],u=1/zoom;
      const V=!(St.width>1&&St.height>1)?null:
        {x0:Math.max(St.left,C.left)-W.left,y0:Math.max(St.top,C.top)-W.top,x1:Math.min(St.right,C.right)-W.left,y1:Math.min(St.bottom,C.bottom)-W.top};
      const inV=(x,y)=>!V||x>=V.x0-1&&x<=V.x1+1&&y>=V.y0-1&&y<=V.y1+1;
      const clV=(x,y)=>V?[clamp(x,V.x0+6,V.x1-6),clamp(y,V.y0+6,V.y1-6)]:[x,y];
      const ROWS=flRows(),CH=flChains(),F=flFoc;
      const port=key=>{
        const it=flItem(key);if(!it)return null;
        const p=it.querySelector('.port'),q=(p||it).getBoundingClientRect(),cr=it.parentNode.getBoundingClientRect();
        let y=p?q.top+q.height/2-W.top:q.top+28-W.top;if(cr.height>1)y=clamp(y,cr.top-W.top+4,cr.bottom-W.top-4);
        return [key[0]==='x'?q.left-W.left:p?q.left+q.width/2-W.left:q.right-11-W.left,y];
      };
      const rowOf=(s,r)=>(ROWS.get(s.id)||[]).find(q=>q.r===r)||null;
      const vis=!flAll?[]:CH.ed.filter(e=>(e.on||flAll)&&rowOf(e.s,e.r));
      const PY=new Map(),py=k=>{if(!PY.has(k))PY.set(k,port(k));return PY.get(k);};
      const byY=(a,b)=>((py(a)||[0,0])[1])-((py(b)||[0,0])[1]);
      const srcL=[...new Set(vis.filter(e=>e.side==='L').map(e=>e.a))].sort(byY);
      const dstR=[...new Set(vis.filter(e=>e.side==='R').map(e=>e.b))].sort(byY);
      const sp=n=>Math.min(7,26/Math.max(1,n-1));
      const left=V?V.x0:ox,right=V?V.x1:ox+S.w*zoom;
      const rkL=id=>srcL.length-1-srcL.indexOf(id),rkR=id=>dstR.length-1-dstR.indexOf(id);
      let laneL=id=>left+10+rkL(id)*sp(srcL.length),laneR=id=>right-10-rkR(id)*sp(dstR.length);
      {
        let xb=Infinity,xo=-Infinity;
        vis.forEach(e=>{
          const R=rowOf(e.s,e.r);
          if(e.side==='L'){
            const tip=R.tips[R.kind==='or'||R.box?e.i:0]||R.tips[0],tb=toB(tip.x,tip.y);if(!inV(tb[0],tb[1]))return;
            xb=Math.min(xb,tb[0]-FL.TRI,R.kind==='and'?toB(R.xl,0)[0]:Infinity);
          }else{const o=toB(R.out.x,R.out.y);if(inV(o[0],o[1]))xo=Math.max(xo,o[0]);}
        });
        const ms=St.width>1,a0=(ms?St.left-W.left:left)+12,a1=xb-14,b0=xo+14,b1=(ms?St.right-W.left:right)-12;
        if(a1-a0>=30)laneL=id=>a0+(rkL(id)+1)*(a1-a0)/(srcL.length+1);
        if(b1-b0>=30)laneR=id=>b1-(rkR(id)+1)*(b1-b0)/(dstR.length+1);
      }
      const arrow=(x,y,tx,ty,c)=>{const a=Math.atan2(ty-y,tx-x),k=7,P=(d,s)=>f(x+Math.cos(a+d)*s)+' '+f(y+Math.sin(a+d)*s);
        return '<path d="M'+P(0,k)+'L'+P(2.5,k)+'L'+P(-2.5,k)+'Z" fill="'+c+'"/>';};
      let back='',halo='',front='',junc='',dots='',warn='',ghost='';
      const br={};
      vis.sort((x,y)=>(x.on?1:0)-(y.on?1:0)).forEach(e=>{
        const R=rowOf(e.s,e.r);let d,T,jy,end=null,tgt=null;
        if(e.side==='L'){
          const P0=py(e.a);if(!P0)return;
          T=laneL(e.a);
          const tip=R.tips[R.kind==='or'||R.box?e.i:0]||R.tips[0],tb=toB(tip.x,tip.y);
          if(!inV(tb[0],tb[1])){end=clV(tb[0],tb[1]);tgt=tb;d=flRoute(P0[0],P0[1],T,end[0],end[1]);jy=end[1]-flBend(P0[0],P0[1],T,end[0],end[1]);}
          else if(R.kind==='and'){
            const a=toB(R.xl,R.ys[e.i]),xb=tb[0]-FL.TRI;a[0]=xb-6>T+6?clamp(a[0],T+6,xb-6):(T+xb)/2;const xm=(a[0]+xb)/2;
            d=flRoute(P0[0],P0[1],T,a[0],a[1])+'C'+f(xm)+' '+f(a[1])+' '+f(xm)+' '+f(tb[1])+' '+f(xb)+' '+f(tb[1]);jy=a[1]-flBend(P0[0],P0[1],T,a[0],a[1]);
          }else{if(tb[0]-FL.TRI<T+4)T=tb[0]-FL.TRI-4;d=flRoute(P0[0],P0[1],T,tb[0]-FL.TRI,tb[1]);jy=tb[1]-flBend(P0[0],P0[1],T,tb[0]-FL.TRI,tb[1]);}
        }else{
          const P1=py(e.b);if(!P1)return;
          let o=toB(R.out.x,R.out.y);
          if(!inV(o[0],o[1])){tgt=o;o=clV(o[0],o[1]);end=o;}
          T=Math.max(laneR(e.b),o[0]+4);d=flRoute(o[0],o[1],T,P1[0],P1[1]);jy=o[1]+flBend(o[0],o[1],T,P1[0],P1[1]);
        }
        const dat=e.nat==='data'&&e.side==='L',dash=e.nat==='tap'?' stroke-dasharray="7 5"':dat?' stroke-dasharray="1 5"':'';
        const tag=' data-fe="'+esc(e.side+'|'+(e.side==='L'?e.a:e.b)+'|'+e.s.id+'|'+e.r.id+(e.side==='L'?'|'+e.i:''))+'"';
        if(e.on){
          halo+='<path d="'+d+'" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
          front+='<path class="fln on'+(dat?' frun':'')+'"'+tag+' d="'+d+'" fill="none" stroke="'+FL.BLUE+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"'+dash+'/>';
          if(end)front+=arrow(end[0],end[1],tgt[0],tgt[1],FL.BLUE);
          const tk=e.side+(e.side==='L'?e.a:e.b);(br[tk]=br[tk]||{T:T,ys:[]}).ys.push(jy);
        }else{
          back+='<path class="fln'+(dat?' frun':'')+'"'+tag+' d="'+d+'" fill="none" stroke="'+FL.GREY+'" stroke-width="'+(dat?2.2:1.5)+'" stroke-linecap="round" stroke-linejoin="round" opacity="'+(F?.25:.5)+'"'+dash+'/>';
          if(end)back+=arrow(end[0],end[1],tgt[0],tgt[1],FL.GREY);
        }
      });
      Object.keys(br).forEach(k=>{const q=br[k];if(q.ys.length<2)return;q.ys.forEach(y=>{junc+='<circle cx="'+f(q.T)+'" cy="'+f(y)+'" r="3" fill="'+FL.BLUE+'" stroke="#fff" stroke-width="1.5"/>';});});
      const hit=coarse?22:10,drag=!!(flDrag&&flDrag.live&&(flDrag.k==='c'||flDrag.k==='x'));
      const incW=(x,y,L)=>{
        const P=L.map(r=>[r,rProblems(r)]).filter(q=>q[1].length);if(!P.length)return '';
        return '<g class="finc" transform="translate('+f(x+13)+' '+f(y)+') scale(.72)"><title>'+esc(P.map(q=>rName(q[0])+': '+q[1].join(', ')).join('\n'))+'</title>'+
          '<path d="M0-9L9 7H-9z" fill="#F2B544" stroke="#5A3A00" stroke-width="1"/><path d="M0-3v4M0 4v.01" stroke="#3A2600" stroke-width="1.8" stroke-linecap="round"/></g>';
      };
      ROWS.forEach((rows,oid)=>rows.forEach(R=>{
        const on=CH.rows.has(oid+'|'+R.r.id);
        {const b=toB(R.out.x,R.out.y);if(inV(b[0],b[1]))warn+=incW(b[0],b[1],[R.r]);}
        if(!on&&!flAll&&!drag)return;
        const fc=on?FL.BLUE:'#E6EAF0',sc=on?'#fff':'#5B6573',da=' data-r="'+R.r.id+'" data-o="'+esc(oid)+'"';
        R.tips.forEach((t,i)=>{
          const b=toB(t.x,t.y);if(!inV(b[0],b[1]))return;
          const tr=on?FL.TRI:7,hh=on?6:4.5;
          dots+='<path class="ftip"'+da+' data-ft="'+i+'" data-x="'+f(t.x)+'" data-y="'+f(t.y)+'" d="M'+f(b[0]-tr)+' '+f(b[1]-hh)+'L'+f(b[0])+' '+f(b[1])+'L'+f(b[0]-tr)+' '+f(b[1]+hh)+'Z" fill="'+fc+'" stroke="'+sc+'" stroke-width="'+(on?1.5:1)+'" stroke-linejoin="round"/>'+
            '<circle class="fa"'+da+' data-ft="'+i+'" data-sx="'+f(b[0])+'" data-sy="'+f(b[1])+'" cx="'+f(b[0]-tr/2)+'" cy="'+f(b[1])+'" r="'+hit+'" fill="transparent"><title>'+esc(rName(R.r))+'</title></circle>';
        });
        const b=toB(R.out.x,R.out.y);if(!inV(b[0],b[1])||rOutHid(R.r))return;
        dots+='<circle class="fout"'+da+' data-x="'+f(R.out.x)+'" data-y="'+f(R.out.y)+'" cx="'+f(b[0])+'" cy="'+f(b[1])+'" r="'+(on?4.5:3)+'" fill="'+fc+'" stroke="'+sc+'" stroke-width="'+(on?2:1)+'"/>'+
          '<circle class="fa"'+da+' data-fo="1" data-sx="'+f(b[0])+'" data-sy="'+f(b[1])+'" cx="'+f(b[0])+'" cy="'+f(b[1])+'" r="'+hit+'" fill="transparent"><title>'+esc(rName(R.r))+': drag to an effect</title></circle>';
      }));
      S.objects.forEach(s=>{
        const c=flConf(s);if(!c.length)return;
        const bb=bboxOf([s]);if(!isFinite(bb.x0))return;
        const p=toB(bb.x1-12*u,bb.y0+14*u);if(!inV(p[0],p[1]))return;
        const op=F&&!CH.objs.has(s.id)?.3:1;
        warn+='<g class="fwarn" data-o="'+esc(s.id)+'" opacity="'+op+'" transform="translate('+f(p[0])+' '+f(p[1])+')"><title>'+esc(c.join('\n'))+'</title>'+
          '<path d="M0-9L9 7H-9z" fill="#F2B544" stroke="#5A3A00" stroke-width="1"/><path d="M0-3v4M0 4v.01" stroke="#3A2600" stroke-width="1.8" stroke-linecap="round"/></g>';
      });
      const D=flDrag;
      if(D&&D.live){
        let s0=null;
        if(D.k==='c')s0=py('c:'+D.id);else if(D.k==='x')s0=py('x:'+D.id);else if(D.k==='out')s0=[D.ax,D.ay];
        if(s0)ghost='<path class="fghost-l" d="M'+f(s0[0])+' '+f(s0[1])+'L'+f(D.x)+' '+f(D.y)+'" fill="none" stroke="'+FL.BLUE+'" stroke-width="2.2" stroke-dasharray="6 4"/><circle cx="'+f(D.x)+'" cy="'+f(D.y)+'" r="5" fill="'+FL.BLUE+'"/>';
      }
      put(E.flw,back+halo+front+junc+dots+warn+ghost);
      let vl='';
      if(F){
        S.objects.forEach(s=>{
          if(!CH.objs.has(s.id)||!flPgS(s))return;
          const hi=F.k==='o'&&F.id===s.id;
          if(isEl(s)){
            const b=flElBox(s),pd=6*u;
            vl+='<rect class="flo'+(hi?' hi':'')+'" x="'+f(b.x0-pd)+'" y="'+f(b.y0-pd)+'" width="'+f(b.x1-b.x0+2*pd)+'" height="'+f(b.y1-b.y0+2*pd)+'" rx="'+f(6*u)+'"/>';
          }else vl+=tagOf(s,'class="flo'+(hi?' hi':'')+'"');
        });
      }
      put(E.flv,vl);
      if(flMenu){
        put(E.fmenu,flMenuHTML(flMenu));E.fmenu.hidden=false;
        const w=E.fmenu.offsetWidth||250,h=E.fmenu.offsetHeight||150;
        E.fmenu.style.left=f(clamp(flMenu.x+14,4,Math.max(4,W.width-w-4)))+'px';
        E.fmenu.style.top=f(clamp(flMenu.y-20,4,Math.max(4,W.height-h-4)))+'px';
      }else E.fmenu.hidden=true;
    }

    function flConf(s){
      const L=RULS().filter(r=>rHas(r,s)),out=[];
      const sec=r=>{const a=new Set();idsStys(rSty(r)).forEach(x=>stUseOf(x).forEach(k=>{if(FL_SEC[k])a.add(k);}));return a;};
      const C=L.filter(r=>rKind(r)==='cond');
      for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++){
        const a=sec(C[i]),b=sec(C[j]),both=[...a].filter(k=>b.has(k));
        if(both.length)out.push('“'+rName(C[i])+'” and “'+rName(C[j])+'” both set '+both.map(k=>FL_SEC[k]).join(', ')+': the first wins when both are true');
        if(s.t==='icon'&&rSymI(C[i])&&rSymI(C[j]))out.push('“'+rName(C[i])+'” and “'+rName(C[j])+'” both change the symbol: the first wins when both are true');
      }
      ['opacity','text'].forEach(p=>{
        const D=L.filter(r=>rKind(r)==='data'&&rFol(r)&&rFol(r).p===p&&folFits(rFol(r),s));
        if(D.length>1)out.push('“'+rName(D[0])+'” and “'+rName(D[1])+'”'+(D.length>2?' and others':'')+' both drive the '+(p==='text'?'text':'photo')+': only the first counts');
      });
      TAP_G.forEach(g=>tapPlan(s,g).forEach(q=>q.ig.forEach(x=>{const o=x.id?tgtOf(x.id):null;
        out.push('“'+rName(x.by)+'” and “'+rName(q.r)+'” both '+(x.k==='pg'?'go to a page':x.k==='info'?'open a more-info':'move “'+(o?o.n||o.id:x.id)+'”')+' on '+(SW_A[g]?'swipe '+SW_A[g]:'tap')+': the first wins');})));
      return out;
    }
    function flMenuHTML(m){
      const opt=(a,b,t,dis)=>'<button type="button" class="opt" data-flm="'+a+'"'+(dis?' disabled':'')+'><b>'+b+'</b>'+(t?'<span>'+t+'</span>':'')+'</button>';
      const r=m.r?ruleOf(m.r):null,k=m.c?causeOf(m.c):null,K=r?rCs(r):[],oth=r?rTgs(r).length-1:0;
      const also=oth>0?' · also on '+oth+(oth===1?' other object':' other objects'):'';
      let h='';
      if(m.k==='drop'&&r&&k){
        const kd=rKind(r),can=k.k==='cond'&&(!kd||kd==='cond')&&r.c.indexOf(k.id)<0,j=K.length>1?(rOr(r)?'or':'and'):'';
        h='<div class="dh"><span class="chip">'+esc(cName(k))+'</span> dropped on</div><div class="rn">'+esc(rName(r))+'</div>'+
          opt('and','Together · AND','same tip: all must be true'+also,!can||j==='or')+
          opt('or','Alternative · OR','one more tip, a single output'+also,!can||j==='and')+
          opt('new','Separate rule','a new row on this object, with its own effect')+
          (r.c.indexOf(k.id)>=0?'<p class="hint" style="margin:0">Already in this rule</p>':!can?'<p class="hint" style="margin:0">'+(k.k!=='cond'?'Data and tap stay alone in a rule':'This rule follows data or a tap')+'</p>':
            j?'<p class="hint" style="margin:0">One level only: this rule is already '+j.toUpperCase()+'</p>':'');
      }else if(m.k==='tip'&&r){
        const s=foOf(m.o),T=K.length>1&&rOr(r)?[K[m.t]].filter(Boolean):K;
        const via=s&&rOn(r).indexOf(s.id)<0?chainOf(s).find(id=>rOn(r).indexOf(id)>=0):null,G=via?grpOf(via):null;
        h='<div class="rn">'+esc(rName(r))+'</div>'+
          (K.length>1?opt('j',rOr(r)?'Switch to AND':'Switch to OR',rOr(r)?'all causes must be true':'any cause is enough'):'')+
          T.map(q=>opt('det:'+q.id,'Detach “'+esc(cName(q))+'”','from this rule'+also)).join('')+
          opt('rm',G?'Remove group “'+esc(G.n||G.id)+'”':'Remove this row',G?'the rule no longer acts on the '+members(G.id).length+' objects of the group':'the rule no longer acts on this object'+(oth?'':'; the rule is deleted'))+
          opt('open','Edit rule','in the panel below');
      }else if(m.k==='out'&&r){
        const X=(Array.isArray(r.fx)?r.fx:[]).filter(x=>x&&(x.k==='look'&&idsStys(x.sty).length||x.k==='sym'||x.k==='pho'));
        h='<div class="rn">'+esc(rName(r))+'</div><p class="hint" style="margin:0">Drag this dot to an effect to connect it</p>'+
          X.map(x=>opt('fxrm:'+x.k,'Remove “'+esc(fxLabel(x))+'”','from this rule'+also)).join('')+
          opt('open','Edit rule','in the panel below');
      }else if(m.k==='newx'){
        const L=styles().filter(Boolean);
        h='<div class="rn">New effect</div>'+opt('nx:newst','New style','a look with a new style, edited below')+opt('nx:newan','New motion','a look with a new motion, edited below')+L.map(x=>opt('nx:look:'+x.id,'Look: '+esc(x.n||'(unnamed)'),'')).join('')+
          phNames(S.objects).map(n=>opt('nx:pho:'+esc(n),'Show photo “'+esc(n)+'”','zones with this photo show it')).join('')+
opt('nx:act','Switch on tap','calls the toggle of an entity')+
          (L.length?'':'<p class="hint" style="margin:0">Looks come from the project styles: create them in Styles</p>');
      }
      return h;
    }

    function flFocus(fc){
      flFoc=fc;flMenu=null;
      if(fc&&(fc.k==='c'||fc.k==='r')){ruCur=fc.id;flRu=ruCur;selRu=true;selTe=false;selSt=false;selBg=false;selG=-1;lastShown='';}
      if(fc)flShow(fc);else flPanel=false;
      render();
    }
    function flNewRow(k,s){
      const r=drNew([s.id]);flMenu=null;if(!r){render();return;}
      rAddCause(r,k);drR0=JSON.stringify(r);
      flFocus({k:'r',id:r.id});
    }
    function flJoin(r,k,j){
      settle();
      rAddCause(r,k);
      if(r.c.length>1){if(j==='or')r.j='or';else delete r.j;}
      flMenu=null;flFocus({k:'r',id:r.id});store(true);
    }
    function flRemoveRow(r,s){
      settle();
      const via=rOn(r).indexOf(s.id)>=0?s.id:chainOf(s).find(id=>rOn(r).indexOf(id)>=0);
      if(via==null)return;
      r.on=r.on.filter(id=>id!==via);
      if(!rOn(r).length){S.rules=RULS().filter(q=>q!==r);if(ruCur===r.id)ruCur='';}
      flMenu=null;flFoc=null;render();store(true);
    }
    function flSetFx(r,x){
      const k=rKind(r);
      if(k&&!FX_OK[k][x.k]){stamp(k==='cond'?'a rule with conditions takes looks and symbols':k==='data'?'a rule with data takes a photo or a text':'a tap rule takes a switch',true);return;}
      settle();
      if(!Array.isArray(r.fx))r.fx=[];
      const i=r.fx.findIndex(q=>q&&q.k===x.k);
      if(i>=0)r.fx[i]=clone(x);else r.fx.push(clone(x));
      flPend=flPend.filter(p=>fxKey(p)!==fxKey(x));
      flMenu=null;flFocus({k:'r',id:r.id});store(true);
    }
    function flMenuAct(a){
      const m=flMenu;if(!m)return;
      const r=m.r?ruleOf(m.r):null,s=m.o?foOf(m.o):null,k=m.c?causeOf(m.c):null;
      if(m.k==='drop'&&r&&k&&s){
        if(a==='and'||a==='or')return flJoin(r,k,a);
        if(a==='new')return flNewRow(k,s);
      }
      if(r&&a==='open'){flMenu=null;ruOpen(r.id);return;}
      if(m.k==='tip'&&r){
        if(a==='j'){settle();if(rOr(r))delete r.j;else r.j='or';flMenu=null;render();store(true);return;}
        if(a.indexOf('det:')===0){settle();const id=a.slice(4);r.c=r.c.filter(q=>q!==id);flMenu=null;render();store(true);return;}
        if(a==='rm'&&s)return flRemoveRow(r,s);
      }
      if(m.k==='out'&&r&&a.indexOf('fxrm:')===0){
        settle();const w=a.slice(5);
        if(w==='look')rLook(r).sty=[];else r.fx=r.fx.filter(x=>!x||x.k!==w);
        flMenu=null;render();store(true);return;
      }
      if(m.k==='newx'&&a.indexOf('nx:')===0){
        const w=a.slice(3);let x;
        if(w==='newst'||w==='newan'){
          settle();const id=stMake(w==='newan'?'+a':'+');
          stCur=id;stGrpCur='';stAn=isAn(stById(id));x={k:'look',sty:[id]};flPend.push(x);
          flMenu=null;flOpen='x:'+fxKey(x);flFocus({k:'x',id:fxKey(x)});store(true);return;
        }
        if(w.indexOf('look:')===0)x={k:'look',sty:[+w.slice(5)]};
        else if(w.indexOf('pho:')===0)x={k:'pho',n:w.slice(4)};
        else if(w==='text')x={k:'follow',p:'text'};
        else x={k:'act',e:''};
        if(!flFx(fxKey(x)))flPend.push(x);
        flMenu=null;flOpen='x:'+fxKey(x);flFocus({k:'x',id:fxKey(x)});return;
      }
      flMenu=null;flReq();
    }
    function flTapItem(key){
      const id=key.slice(2),k=key[0]==='c'?'c':'x';
      if(flFoc&&flFoc.k===k&&flFoc.id===id){flOpen=flOpen===key?'':key;if(flCv&&flOpen)flNar.l=false;render();return;}
      flOpen=flCv&&k==='c'?key:'';flFocus({k:k,id:id});
    }
    function flNetSel(on){selRu=on;selTe=false;selSt=false;selBg=false;selG=-1;lastShown='';}
    function flSet(on,cv){
      if(on===flow)return;
      flow=on;flMenu=null;flDrag=null;pgStop();clkStop();
      if(on){
        flCv=!!cv;flVal=false;flTap=false;
        fnV=null;flRu='';
        draft=null;if(tool!=='select')setTool('select');
        if(flCv)fadeIn=true;else flNetSel(true);
      }else{flFoc=null;flOpen='';flPend=[];if(!flCv)flNetSel(false);flCv=false;}
      flDockMove(on&&!flCv);
      if(on)flColsReset();
      flLayout();
      flPanel=false;flDock();
      fit();if(on)flReq();else flDraw();
      if(fadeIn){fadeIn=false;requestAnimationFrame(()=>requestAnimationFrame(draw));}
    }
    let fdHome=null;
    function flDockMove(on){
      const bar=root.querySelector('.abar'),det=E.detail;
      if(on){
        if(!fdHome)fdHome={bar:[bar.parentNode,bar.nextSibling],det:[det.parentNode,det.nextSibling]};
        E.fdbar.appendChild(bar);E.fdbody.appendChild(det);
      }else if(fdHome){
        fdHome.bar[0].insertBefore(bar,fdHome.bar[1]);fdHome.det[0].insertBefore(det,fdHome.det[1]);
      }
      if(E.list.fold)E.list.fold();
    }
    function flDock(){
      const was=E.fdock.hidden;
      let t='';
      if(flow&&flPanel&&!flCv){
        const r=selRu&&ruleOf(ruCur),k=selRu&&!r&&causeOf(ruCur),G=selGrp!=null&&grpOf(selGrp);
        if(selSt&&stById(stCur))t='Style · '+stName(stCur);
        else if(selTe&&teCur){const st=simStates(true)[teCur];t='Test · '+((st&&st.attributes&&st.attributes.friendly_name)||teCur);}
        else if(r)t='Rule · '+rName(r);
        else if(k)t='Cause · '+cName(k);
        else if(!selSt&&!selRu&&G)t='Group · '+(G.n||G.id);
        else if(!selSt&&!selRu&&ms.length)t=ms.length===1?(ms[0].n||ms[0].id):ms.length+' objects';
        else if(!selSt&&!selRu&&selBg)t='Background';
      }
      E.fdock.hidden=!t;
      if(E.fdtit.textContent!==t)E.fdtit.textContent=t;
      if(was!==E.fdock.hidden&&flow)flReq();
    }
    function flLayout(){
      mdTabs();
      E.wk.classList.toggle('flow',flow);E.wk.classList.toggle('fll',flow&&!flCv);$('header').classList.toggle('fll',flow&&!flCv);
      E.main.classList.toggle('flp',flow&&!flCv);E.sbot.classList.toggle('fll',flow&&!flCv);
      const net=flow&&!flCv;E.wk.classList.toggle('fnt',net);E.fnet.hidden=!net;
      E.fcl.hidden=!flow||net;E.fcr.hidden=true;
      E.flines.hidden=true;if(flAll){flAll=false;E.flines.querySelectorAll('[data-fl]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.fl==='sel')));}
      E.flsort.hidden=true;E.flreal.hidden=!Object.keys(SIM()).length&&!S.clk;E.fgl.hidden=!(flow&&flCv);E.fgr.hidden=true;
    }
    function flCvSet(v){
      if(!flow||v===flCv)return;
      flCv=v;flMenu=null;flDrag=null;pgStop();clkStop();
      if(v)fadeIn=true;else flNetSel(true);
      flDockMove(!v);flColsReset();flLayout();flDock();
      if(v)fit();else render();
      flReq();
      if(fadeIn){fadeIn=false;requestAnimationFrame(()=>requestAnimationFrame(draw));}
    }
    function flShow(fc){
      if(!flow)return;
      flPanel=true;
      if(!fc)return;
      if(fc.k==='o'&&bgOf(fc.id)){pick([]);selGrp=null;selRu=false;selTe=false;selSt=false;selBg=true;selPg=false;selG=-1;lastShown='';}
      else if(fc.k==='o'){const s=S.objects.find(q=>q.id===fc.id);if(s){pick([s]);selGrp=null;selRu=false;selTe=false;selSt=false;selBg=false;selG=-1;lastShown='';}}
      else if(fc.k==='x'){
        const q=flFx(fc.id),x=q&&q.fx,st=x&&x.k==='look'&&Array.isArray(x.sty)?x.sty.find(id=>stById(id)):null;
        if(st!=null){stCur=st;stGrpCur='';stAn=isAn(stById(st));stMs=ms.slice();selSt=true;selRu=false;selTe=false;selBg=false;selG=-1;lastShown='';}
        else if(q&&q.rules.length){ruCur=q.rules[0].id;flRu=ruCur;selRu=true;selTe=false;selSt=false;selBg=false;selG=-1;lastShown='';}
      }
    }
    function flReset(){flFoc=null;flOpen='';flPend=[];flMenu=null;flDrag=null;flRu='';}

    function flDown(e,info){
      if(e.pointerType==='mouse'&&e.button!==0)return;
      const W=E.wk.getBoundingClientRect();
      flSkip=false;
      flDrag=Object.assign({sx:e.clientX,sy:e.clientY,x:e.clientX-W.left,y:e.clientY-W.top,live:false,pid:e.pointerId},info);
    }
    E.wk.addEventListener('pointermove',e=>{
      const D=flDrag;if(!D||e.pointerId!==D.pid)return;
      const dx=e.clientX-D.sx,dy=e.clientY-D.sy;
      if(!D.live){
        if(Math.abs(dx)+Math.abs(dy)<TAP||D.k==='tip')return;
        D.live=true;flMenu=null;
        try{E.wk.setPointerCapture(e.pointerId);}catch(_){}
      }
      const W=E.wk.getBoundingClientRect();D.x=e.clientX-W.left;D.y=e.clientY-W.top;flReq();
    });
    E.wk.addEventListener('pointerup',e=>{
      const D=flDrag;if(!D||e.pointerId!==D.pid)return;
      flDrag=null;
      if(!D.live){if(D.k==='tip'||D.k==='out')flAnchorTap(D);flReq();return;}
      flSkip=true;setTimeout(()=>{flSkip=false;},350);
      flDrop(D,e.clientX,e.clientY);
      if(D.k==='c'&&!flCv)flCols();
      flReq();
    });
    E.wk.addEventListener('pointercancel',e=>{
      const D=flDrag;if(!D||e.pointerId!==D.pid)return;
      flDrag=null;if(D.live&&D.k==='c'&&!flCv)flCols();flReq();
    });
    function flAnchorTap(D){
      const r=ruleOf(D.r);if(!r)return;
      flFoc={k:'r',id:r.id};ruCur=r.id;flRu=ruCur;selRu=true;selTe=false;selSt=false;selBg=false;selG=-1;
      flMenu={k:D.k,r:r.id,o:D.o,t:D.t||0,x:D.ax,y:D.ay};
      render();
    }
    function flDrop(D,cx,cy){
      const el=root.elementFromPoint?root.elementFromPoint(cx,cy):null,at=q=>el&&el.closest?el.closest(q):null;
      if(D.k==='c'){
        const k=causeOf(D.id);if(!k)return;
        const tp=at('#flw .fa[data-ft]');
        if(tp){
          const r=ruleOf(tp.dataset.r);if(!r)return;
          flMenu={k:'drop',r:r.id,o:tp.dataset.o,c:k.id,x:+tp.dataset.sx,y:+tp.dataset.sy};flFoc={k:'r',id:r.id};render();return;
        }
        const z=at('#shapes [data-i]'),s=z?(z.dataset.bl?bgOf(z.dataset.bl):S.objects[+z.dataset.i]):null;
        if(s&&isCard(s)&&k.k==='data'){stamp('cards take no values',true);return;}
        if(s)flNewRow(k,s);
        return;
      }
      if(D.k==='out'){
        const it=at('#fcr .fit[data-fk]'),r=ruleOf(D.r);if(!it||!r)return;
        const q=flFx(it.dataset.fk.slice(2));if(q)flSetFx(r,q.fx);
      }
      if(D.k==='x'){
        const q=flFx(D.id);if(!q)return;
        const fo=at('#flw .fa[data-fo]');
        if(fo){const r=ruleOf(fo.dataset.r);if(r)flSetFx(r,q.fx);return;}
        const z=at('#shapes [data-i]'),s=z?(z.dataset.bl?bgOf(z.dataset.bl):S.objects[+z.dataset.i]):null;if(!s||isCard(s)&&q.fx.k!=='look'&&q.fx.k!=='act')return;
        const free=RULS().filter(r=>rOn(r).indexOf(s.id)>=0&&!(Array.isArray(r.fx)?r.fx:[]).some(x=>x&&!fxVoid(x)));
        if(free.length)flSetFx(free[free.length-1],q.fx);
        else stamp('no rule with a free output on '+(s.n||s.id)+': drag a cause onto it first',true);
      }
    }
    E.fcl.addEventListener('change',e=>{
      const i=e.target.closest('[data-flsim]'),k=i&&causeOf(i.dataset.flsim);if(!k||!k.e)return;
      settle();simPut(k.e,k.a?'a:'+k.a:'s',i.value.trim());render();store(true);
    });
    E.fcl.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('[data-flsim]'))e.target.blur();});
    {
      let q=null,raf=0;
      const go=()=>{raf=0;const x=q;q=null;if(x){flSlPut(x.k,x.v);render();store();}};
      const end=()=>{if(!flSlOn)return;flSlOn=false;if(raf){cancelAnimationFrame(raf);go();}if(flow)flCols();};
      E.fcl.addEventListener('pointerdown',e=>{if(e.target.closest('[data-flsl]')){settle();flSlOn=true;}});
      E.fcl.addEventListener('input',e=>{
        const i=e.target.closest('[data-flsl]'),k=i&&causeOf(i.dataset.flsl);if(!k||!k.e)return;
        const it=i.closest('.fit'),t=it.querySelector('.fsl .v'),b=it.querySelector('.fbar b'),lo=+i.min,hi=+i.max;
        if(t)t.textContent=flSlT(i.value,+i.step);
        if(b)b.style.left=Math.round(clamp((i.value-lo)/(hi-lo)*100,0,100)*10)/10+'%';
        q={k:k,v:i.value};if(!raf)raf=requestAnimationFrame(go);
      });
      E.fcl.addEventListener('change',e=>{if(e.target.closest('[data-flsl]'))end();});
      E.fcl.addEventListener('pointerup',end);E.fcl.addEventListener('pointercancel',end);
      E.fcl.addEventListener('keydown',e=>{if(e.target.closest('[data-flsl]')&&!flSlOn){settle();flSlOn=true;}});
      E.fcl.addEventListener('keyup',e=>{if(e.target.closest('[data-flsl]'))end();});
    }
    {
      let q=null,raf=0;
      const go=()=>{raf=0;const t=q;q=null;if(t!=null){clkSet(t);render();store();}};
      const end=()=>{if(!flClkOn)return;flClkOn=false;if(raf){cancelAnimationFrame(raf);go();}store(true);if(flow)flCols();};
      E.fcl.addEventListener('pointerdown',e=>{
        if(e.target.closest('[data-flck],[data-flct],[data-flcd]')&&clkPl){
          clkStop();const p=E.fcl.querySelector('[data-flckp]');if(p){p.textContent='▶\uFE0E';p.title='Play';p.setAttribute('aria-label','Play');}
        }
        if(e.target.closest('[data-flck]')){settle();flClkOn=true;}
      });
      E.fcl.addEventListener('input',e=>{
        const i=e.target.closest('[data-flck]');if(!i)return;
        const it=i.closest('.fit'),o=it.querySelector('[data-flct]');
        if(o)o.value=p2(Math.floor(+i.value/60))+':'+p2(+i.value%60);
        const t=flClkT(it),n=it.querySelector('.row .nm');
        if(n)n.textContent=clkTxt(clkP(t,clkTz()));
        if(!it.classList.contains('frc'))it.classList.add('frc');
        q=t;if(!raf)raf=requestAnimationFrame(go);
      });
      E.fcl.addEventListener('change',e=>{
        if(e.target.closest('[data-flck]')){end();return;}
        const d=e.target.closest('[data-flcd],[data-flct]');if(!d)return;
        clkStop();settle();clkSet(flClkT(d.closest('.fit')));render();store(true);
      });
      E.fcl.addEventListener('pointerup',end);E.fcl.addEventListener('pointercancel',end);
      E.fcl.addEventListener('keydown',e=>{if(e.target.closest('[data-flck]')&&!flClkOn){clkStop();settle();flClkOn=true;}});
      E.fcl.addEventListener('keyup',e=>{if(e.target.closest('[data-flck]'))end();});
    }
    E.fcl.addEventListener('pointerdown',e=>{
      const it=e.target.closest('.fit[data-fk]');
      if(!it||e.target.closest('.more button,.more input,.fsl'))return;
      flDown(e,{k:'c',id:it.dataset.fk.slice(2)});
    });
    E.fcr.addEventListener('pointerdown',e=>{
      const it=e.target.closest('.fit[data-fk]');
      if(!it||e.target.closest('.more button'))return;
      flDown(e,{k:'x',id:it.dataset.fk.slice(2)});
    });
    E.flw.addEventListener('pointerdown',e=>{
      const a=e.target.closest('.fa');if(!a)return;
      e.stopPropagation();e.preventDefault();
      flDown(e,{k:a.dataset.ft!=null?'tip':'out',r:a.dataset.r,o:a.dataset.o,t:+a.dataset.ft||0,ax:+a.dataset.sx,ay:+a.dataset.sy});
    });
    function flTest(id){
      const k=causeOf(id);if(!k||!k.e)return;
      if(k.k==='data'&&flCv){
        if(flRng(k)){flSl=flSl===k.id?'':k.id;if(flSl)flNar.l=false;flCols();return;}
        const key='c:'+k.id,op=flOpen!==key;flFoc={k:'c',id:k.id};flOpen=op?key:'';if(op)flNar.l=false;flMenu=null;render();
        if(op){const i=E.fcl.querySelector('[data-flsim="'+fnEsc(k.id)+'"]');if(i){i.focus();i.select();}}
        return;
      }
      if(k.k==='data'){
        teCur=k.e;selTe=true;selRu=false;selSt=false;selBg=false;selG=-1;lastShown='';
        flFoc={k:'c',id:k.id};flOpen='';flPanel=true;render();return;
      }
      const w=k.a?'a:'+k.a:'s',want=!cLive(k),old=JSON.stringify(SIM());
      const back=()=>{const o=JSON.parse(old);if(Object.keys(o).length)S.sim=o;else delete S.sim;};
      const C=[''],add=x=>{if(x==null)return;x=String(x);if(C.indexOf(x)<0)C.push(x);};
      const num=x=>x!==''&&x!=null&&isFinite(+x)?+x:null,v=num(k.v),v2=num(k.v2);
      add(k.v);if(k.op==='btw')add(k.v2);
      if(v!=null){add(v+1);add(v-1);if(v2!=null){add((v+v2)/2);add(v2+1);}}
      if(!want)add('undefined');
      teOpts(k.e,teEnts().get(k.e)||{c:[k]},w).forEach(add);
      ['on','off','unavailable'].forEach(add);
      const O=want?[]:CAUS().filter(q=>q!==k&&q.k==='cond'&&q.e===k.e),on0=new Set(O.filter(cLive));
      settle();
      let first=null;
      for(const x of C){
        back();simPut(k.e,w,x);
        if(cLive(k)!==want)continue;
        if(x===''||O.every(q=>on0.has(q)||!cLive(q))){render();store(true);return;}
        if(first==null)first=x;
      }
      if(first!=null){back();simPut(k.e,w,first);render();store(true);return;}
      back();stamp('no test value found for “'+cName(k)+'”: set it in Test',true);
    }
    function flColClick(e){
      if(flSkip){flSkip=false;return;}
      if(e.target.closest('[data-flsim],[data-flsl],[data-flck],[data-flcd],[data-flct]'))return;
      const sx=e.target.closest('[data-flsimx]');
      if(sx){const k=causeOf(sx.dataset.flsimx);if(k&&k.e){settle();flSlClr(k);render();store(true);}return;}
      if(e.target.closest('[data-flckp]')){if(clkPl)clkStop();else clkPlay();render();return;}
      if(e.target.closest('[data-flckx]')){clkStop();if(S.clk){settle();clkOff();render();store(true);}return;}
      if(e.target.closest('.fclk .fsl'))return;
      if(e.target.closest('[data-flclk]')){flClkOp=!flClkOp;if(flClkOp)flNar.l=false;render();return;}
      if(e.target.closest('.fsl'))return;
      const fo=e.target.closest('[data-flfold]');
      if(fo){
        const w=fo.dataset.flfold;flNar[w]=!flNar[w];
        render();return;
      }
      const op=e.target.closest('[data-flopen]');
      if(op){ruOpen(op.dataset.flopen);return;}
      if(e.target.closest('[data-flval]')){flVal=!flVal;flCols();return;}
      if(e.target.closest('[data-fltap]')){flTap=!flTap;flCols();return;}
      const tr=e.target.closest('[data-fltr]');
      if(tr){const id=tr.dataset.fltr;flOpen='';flFocus(flFoc&&flFoc.k==='r'&&flFoc.id===id?null:{k:'r',id:id});return;}
      const it=e.target.closest('.fit[data-fk]'),b=e.target.closest('[data-fla]');
      if(it&&e.target.closest('[data-fltg]')){flTest(it.dataset.fk.slice(2));return;}
      if(b){
        const w=b.dataset.fla;
        if(w==='newc'){const k=drCNew(null);flOpen='';flFocus({k:'c',id:k.id});return;}
        if(w==='newx'){const r=b.getBoundingClientRect(),W=E.wk.getBoundingClientRect();flMenu={k:'newx',x:r.left-W.left-270,y:r.top-W.top};flReq();return;}
        const key=it&&it.dataset.fk;if(!key)return;
        if(w==='drop'){const k=key.slice(2);flPend=flPend.filter(x=>fxKey(x)!==k);flFoc=null;flOpen='';render();return;}
        return;
      }
      if(it&&e.target.closest('.more')){const key=it.dataset.fk;flShow({k:key[0],id:key.slice(2)});render();return;}
      if(it)flTapItem(it.dataset.fk);
    }
    E.fcl.addEventListener('click',flColClick);
    E.fcr.addEventListener('click',flColClick);
    [E.fgl,E.fgr].forEach(g=>{
      const w=g.dataset.flg,col=w==='l'?E.fcl:E.fcr;let gx=null,gw=0;
      g.addEventListener('pointerdown',e=>{
        gx=e.clientX;gw=col.offsetWidth;g.classList.add('on');g.setPointerCapture(e.pointerId);e.preventDefault();
        const o=w==='l'?'r':'l';if(!flNar[o]&&flW[o]==null)flW[o]=(o==='l'?E.fcl:E.fcr).offsetWidth;
      });
      g.addEventListener('pointermove',e=>{
        if(gx==null)return;
        const dx=e.clientX-gx;
        flW[w]=Math.round(clamp(gw+(w==='l'?dx:-dx),80,Math.max(80,E.wk.clientWidth*.4)));flNar[w]=false;
        flCols();flReq();
      });
      const end=()=>{if(gx==null)return;gx=null;g.classList.remove('on');render();};
      g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);
      g.addEventListener('dblclick',()=>{flW[w]=null;flNar[w]=false;render();});
    });
    E.fdx.addEventListener('click',()=>{flPanel=false;render();});
    {
      const setH=h=>E.wk.style.setProperty('--fdh',h+'px');
      try{const h=+localStorage.getItem(KEY+'-fdockh');if(h>=100)setH(h);}catch(_){}
      let gy=null,gh=0;
      const setW=w=>E.wk.style.setProperty('--fdw',w+'px');
      try{const w=+localStorage.getItem(KEY+'-fdockw');if(w>=260)setW(w);}catch(_){}
      const col=()=>getComputedStyle(E.fdgrip).cursor==='ew-resize';
      let gx=null,gw=0,vc=false;
      E.fdgrip.addEventListener('pointerdown',e=>{vc=col();gy=e.clientY;gx=e.clientX;gh=E.fdock.offsetHeight;gw=E.fdock.offsetWidth;E.fdgrip.classList.add('on');E.fdgrip.setPointerCapture(e.pointerId);e.preventDefault();});
      E.fdgrip.addEventListener('pointermove',e=>{
        if(gy==null)return;
        if(vc)setW(Math.round(clamp(gw+gx-e.clientX,260,Math.max(260,E.wk.clientWidth-320))));
        else setH(Math.round(clamp(gh+gy-e.clientY,100,Math.max(100,E.wk.clientHeight-140))));
        flReq();
      });
      const end=()=>{if(gy==null)return;gy=null;E.fdgrip.classList.remove('on');
        try{if(vc)localStorage.setItem(KEY+'-fdockw',E.fdock.offsetWidth);else localStorage.setItem(KEY+'-fdockh',E.fdock.offsetHeight);}catch(_){}};
      E.fdgrip.addEventListener('pointerup',end);E.fdgrip.addEventListener('pointercancel',end);
      E.fdgrip.addEventListener('dblclick',()=>{const k=col()?'w':'h';E.wk.style.removeProperty('--fd'+k);try{localStorage.removeItem(KEY+'-fdock'+k);}catch(_){}flReq();});
    }
    E.fmenu.addEventListener('click',e=>{const b=e.target.closest('[data-flm]');if(b&&!b.disabled)flMenuAct(b.dataset.flm);});
    E.flines.addEventListener('click',e=>{
      const b=e.target.closest('[data-fl]');if(!b)return;
      flAll=b.dataset.fl==='all';
      E.flines.querySelectorAll('[data-fl]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));
      flReq();
    });
    function mdTabs(){
      const ed=!flow;
      [[E.edit,ed&&!drawerOpen],[E.fltest,flow&&flCv],[E.flow,flow&&!flCv],[E.exp,ed&&drawerOpen]]
        .forEach(([b,on])=>{if(b.getAttribute('aria-selected')!==String(on))b.setAttribute('aria-selected',String(on));});
      $('#tools').classList.toggle('off',!(ed&&!drawerOpen));
    }
    let mdScr=null;
    function mdGo(m){
      const code=m==='code';
      flGo(m==='net'||m==='test'?m:'');
      if(drawerOpen===code)return;
      if(code)mdScr=[stage.scrollLeft,stage.scrollTop];
      drawerOpen=code;$('#drawer').classList.toggle('open',code);E.main.classList.toggle('code',code);$('header').classList.toggle('code',code);E.sbot.classList.toggle('code',code);
      if(code)refreshOut();
      else{clearTimeout(outT);if(mdScr){stage.scrollLeft=mdScr[0];stage.scrollTop=mdScr[1];mdScr=null;}}
      mdTabs();
    }
    E.edit.addEventListener('click',()=>mdGo('edit'));
    E.fltest.addEventListener('click',()=>mdGo('test'));
    E.flow.addEventListener('click',()=>mdGo('net'));
    E.exp.addEventListener('click',()=>mdGo('code'));
    function flGo(m){
      if(m==='net'||m==='test'){
        if(flow){flCvSet(m==='test');return;}
        flSet(true,m==='test');return;
      }
      if(flow){flSet(false);return;}
      flLayout();
    }
    E.flsort.addEventListener('click',()=>{if(flow)flSort();});
    E.flreal.addEventListener('click',e=>{if(!e.target.closest('button:not(:disabled)')||!S.sim&&!S.clk)return;clkStop();settle();delete S.sim;delete S.clk;render();store(true);});
    stage.addEventListener('scroll',flReq,{passive:true});
    E.fcl.addEventListener('scroll',flReq,{passive:true});
    E.fcr.addEventListener('scroll',flReq,{passive:true});
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(flReq).observe(E.wk);

    function stUse(id){
      const u={z:0,l:0,i:0,c:0,b:0,r:0};
      if(id>0)RULS().forEach(r=>{if((Array.isArray(r.fx)?r.fx:[]).some(x=>x&&((x.k==='look'||x.k==='act')&&Array.isArray(x.sty)&&x.sty.indexOf(id)>=0||x.k==='mv'&&Array.isArray(x.mo)&&x.mo.indexOf(id)>=0)))u.r++;});
      if(id>0)BGS().forEach(b=>{if(styIds(b).indexOf(id)>=0)u.b++;});
      S.objects.forEach(s=>{
        if(isCard(s)){if(id>0&&styIds(s).indexOf(id)>=0)u.c++;return;}
        const k=kindOf(s);
        if(id<=0?defId(k)===id:styIds(s).indexOf(id)>=0)u[k]++;
      });
      return u;
    }
    const N3=[['z','zone','zones'],['l','label','labels'],['i','icon','icons'],['c','card','cards'],['b','background layer','background layers'],['r','rule','rules']];
    function useText(u,all){
      const t=N3.filter(x=>u[x[0]]).map(x=>u[x[0]]+' '+(u[x[0]]===1?x[1]:x[2]));
      return t.length?t.join(', '):(all?'no items':'0');
    }
    function stName(id){const x=stById(id);return (x&&x.n)||'(unnamed)';}
    const STAR='M12 3l2.4 5.6 6 .5-4.6 4 1.4 5.9L12 15.9 6.8 19l1.4-5.9-4.6-4 6-.5z';
    const SWX={u:p=>vurl(p),sw:true};
    const SWM=Object.assign({ps:.25},SWX);
    function stAttrs(p,gid,fid,el){
      let a='fill="'+fillV(p,gid,el)+'"';
      if(p.sw>0)a+=' stroke="'+rgba(p.sc,p.sa)+'" stroke-width="'+f(p.sw)+'"'+(el?' paint-order="stroke" stroke-linejoin="round"':
        p.sd==='d'?' stroke-dasharray="'+f(p.sw*4)+' '+f(p.sw*3)+'"':p.sd==='p'?' stroke-dasharray="0 '+f(p.sw*2.5)+'" stroke-linecap="round"':'');
      if(p.g)a+=' filter="url(#'+fid+')"';
      return a+' opacity="'+(+clamp(p.op,0,1).toFixed(2))+'"';
    }
    function txAttrs(st){
      const t=txOf(st),d=[];
      if(t.ff)d.push('font-family:'+txFam(t.ff));
      if(t.fw)d.push('font-weight:'+t.fw);
      if(t.fi)d.push('font-style:italic');
      if(t.ls)d.push('letter-spacing:'+f(t.ls)+'px');
      if(t.up)d.push('text-transform:uppercase');
      return d.length?' style="'+esc(d.join(';'))+'"':'';
    }
    const SEC_K={f:['f','fv','fc','fa','fc2','fa2','fg','ft','fp','fsp','pz','pw','isz','ip','ifit','ia','iw','ih'],b:['sw','sc','sa','sd'],g:['g','gc','ga','gb','gx','gy'],o:['op'],m:['bm'],v:Object.keys(FD_K),x:TF_K};
    function stMerge(base,list){
      const o=clone(base),n=stState(base,'n');
      list.forEach(x=>{
        const U=stUseOf(x),p=stState(x,'n');
        U.forEach(k=>{(SEC_K[k]||[]).forEach(j=>{n[j]=p[j];});});
        if(U.indexOf('f')>=0)o.hov=x.hov;
        if(U.indexOf('t')>=0){o.dur=x.dur;o.ease=x.ease;}
        if(U.indexOf('a')>=0){o.anim=x.anim;AN_K.forEach(k=>{if(x[k]==null)delete o[k];else o[k]=x[k];});}
        const t=txOf(x);if(Object.keys(t).length)o.tx=Object.assign({},txOf(o),t);
      });
      o.st={n:n};delete o.use;
      return o;
    }
    const stOver=(st,id,k)=>id>0?stMerge(defOf(defId(k)),[st]):st;
    function stMini(st,k,pre,id){
      const M=stOver(st,id,id===-1?'l':id===-2?'i':'z'),p=stState(M,'n'),ds=stDefs(M,pre,'',SWM).join(''),at=el=>stAttrs(p,'grad-'+pre+'-n','glow-'+pre+'-n',el);
      return (ds?'<defs>'+ds+'</defs>':'')+(id===-1?'<text x="15" y="15" font-size="15" font-weight="600" text-anchor="middle" '+at(true)+txAttrs(M)+'>Aa</text>':
        id===-2?'<path transform="translate(5,0) scale(.85)" d="'+STAR+'" '+at(true)+'/>':
        '<rect x="2" y="2" width="26" height="16" rx="3" '+at(false)+'/>');
    }
    function stSample(st){
      const M={},at={};let ds='';
      ['z','l','i'].forEach(k=>{
        M[k]=stOver(st,stCur,k);const p=stState(M[k],'n');
        ds+=stDefs(M[k],k,'sw',SWX).join('');
        at[k]=el=>stAttrs(p,'swgrad-'+k+'-n','swglow-'+k+'-n',el);
      });
      const bg=bgBase()?'<image href="'+esc(vurl(bgBase()))+'" x="0" y="0" width="240" height="96" preserveAspectRatio="xMidYMid slice"/>'
                       :'<rect width="240" height="96" fill="url(#sw-chk)"/>';
      return '<svg id="stsw" viewBox="0 0 240 96" xmlns="http://www.w3.org/2000/svg"><defs>'+
        '<pattern id="sw-chk" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/>'+
        '<rect width="8" height="8" fill="#ddd"/><rect x="8" y="8" width="8" height="8" fill="#ddd"/></pattern>'+ds+'</defs>'+bg+
        stShapes(stCur,k=>at[k](k!=='z'),txAttrs(M.l))+'</svg>';
    }
    function anSample(st){
      const fr=isFr(st)&&!moFam(st,'ws'),A=anOf(st,stState(st,'n'),'z',null,fr?'r':'ws'),nm='sw-an-'+st.id;
      if(fr){
        const w='<path fill="#5b6577" d="M0 0L1.1 0L0 1.1Z"/><path fill="#c5cbd6" d="M0 0L0 1.1L-1.1 0Z"/><path fill="#5b6577" d="M0 0L-1.1 0L0 -1.1Z"/><path fill="#c5cbd6" d="M0 0L0 -1.1L1.1 0Z"/>';
        return '<svg id="stsw" viewBox="0 0 240 96" xmlns="http://www.w3.org/2000/svg">'+(A?'<style>@media (prefers-reduced-motion: no-preference){ #stsw .swfr{ animation: '+nm+' '+A.sh+'; } }'+
          ' #stsw .swfr{ transform-box: view-box; transform-origin: 0 0; } @keyframes '+nm+'{ '+A.kf+' }</style>':'')+
          '<defs><pattern id="sw-fr" patternUnits="userSpaceOnUse" x="60" y="18" width="120" height="60"><g transform="translate(60 30)"><g class="swfr"><g transform="scale(68)" shape-rendering="crispEdges">'+w+'</g></g></g></pattern></defs>'+
          '<rect x="60" y="18" width="120" height="60" rx="10" fill="url(#sw-fr)" stroke="#5b6577" stroke-width="2"/></svg>';
      }
      const css=A?'<style>@media (prefers-reduced-motion: no-preference){ #stsw .swa{ animation: '+nm+' '+A.sh+';'+(A.tf?' transform-box: fill-box; transform-origin: '+A.og+';':'')+' } }'+
        ' @keyframes '+nm+'{ '+A.kf+' }</style>':'';
      const at=el=>'fill="'+(el?'#5b6577':'rgba(91,101,119,0.45)')+'"'+(el?'':' stroke="#5b6577" stroke-width="2"');
      return '<svg id="stsw" viewBox="0 0 240 96" xmlns="http://www.w3.org/2000/svg">'+css+'<defs>'+
        '<pattern id="sw-chk" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/>'+
        '<rect width="8" height="8" fill="#ddd"/><rect x="8" y="8" width="8" height="8" fill="#ddd"/></pattern></defs>'+
        '<rect width="240" height="96" fill="url(#sw-chk)"/>'+
        '<rect class="swa" x="14" y="18" width="120" height="60" rx="10" '+at(false)+'/>'+
        '<text class="swa" x="182" y="36" font-size="21" font-weight="600" text-anchor="middle" dominant-baseline="middle" '+at(true)+'>21.5 °C</text>'+
        '<g class="swa"><path transform="translate(166,52) scale(1.35)" d="'+STAR+'" '+at(true)+'/></g></svg>';
    }
    function stShapes(id,at,ta){
      const T='<text x="'+(id===-1?120:182)+'" y="'+(id===-1?50:36)+'" font-size="'+(id===-1?30:21)+'" font-weight="600" text-anchor="middle" dominant-baseline="middle" '+at('l')+(ta||'')+'>21.5 °C</text>';
      const I='<path transform="'+(id===-2?'translate(96,22) scale(2.2)':'translate(166,52) scale(1.35)')+'" d="'+STAR+'" '+at('i')+'/>';
      const Z='<rect x="'+(id===0?44:14)+'" y="18" width="'+(id===0?152:120)+'" height="60" rx="10" '+at('z')+'/>';
      return id===0?Z:id===-1?T:id===-2?I:Z+T+I;
    }
    function stRows(){
      const L=stSorted().filter(x=>isAn(x)===stAn),GR=SGR().slice().sort(stCmp);
      if(!L.length&&!GR.length)return stAn?'<p class="hint" style="margin:6px">No motions</p>':'<p class="hint" style="padding:6px 8px">No styles yet: objects without styles are transparent. Create one with +.</p>';
      const U=new Map(L.map(x=>[x.id,stUse(x.id)])),used=x=>Object.values(U.get(x.id)).some(Boolean);
      const row=(st,ind)=>{const id=st.id,a=isAn(st),T=a?AN[st.anim]:null;
        return '<div class="sr'+(id===stCur&&!stGrpCur?' on':'')+(used(st)?'':' un')+'" data-sr="'+id+'" data-sgm="'+esc(GR.indexOf(stGrp(st))>=0?stGrp(st):'')+'"'+(ind?indent(1):'')+'><svg viewBox="0 0 30 20">'+(a?'<path d="M11 4v12l10-6z" fill="currentColor"/>':stMini(st,'n','ls'+id,id))+'</svg>'+
          '<span class="nm">'+esc(stName(id))+'</span><span class="sb">'+(a&&T?esc(T.l)+' · '+f(anNum(st.ad,.05,600,T.d))+' s · ':'')+useText(U.get(id))+'</span></div>';};
      const fd=fold();let h='';
      GR.forEach(g=>{const M=L.filter(x=>stGrp(x)===g),k='S:'+g,cl=fd.has(k);
        h+='<div class="grh'+(stGrpCur===g?' on':'')+'" data-sg="'+esc(g)+'"><span class="fold" data-fold="'+esc(k)+'">'+(cl?'▸':'▾')+'</span>'+esc(g)+'<span class="gc">'+M.length+'</span></div>';
        if(!cl)h+=M.map(x=>row(x,true)).join('');});
      const N=L.filter(x=>GR.indexOf(stGrp(x))<0);
      h+=N.filter(used).map(x=>row(x,false)).join('');
      const off=N.filter(x=>!used(x));
      if(off.length)h+='<p class="lh">unused</p>'+off.map(x=>row(x,false)).join('');
      return h;
    }
    const clrFld=(l,kc,ka,p)=>'<div class="f">'+l+'<span class="clr"><input type="color" data-sp="'+kc+'" value="'+esc(p[kc])+'" aria-label="'+l+'">'+
      '<input class="num" type="range" min="0" max="1" step="0.05" data-sp="'+ka+'" value="'+p[ka]+'" title="Color opacity" aria-label="Color opacity"></span></div>';
    const numFld=(l,k,v,a,unit)=>'<label class="f">'+l+'<span><input class="num" type="number" '+a+' data-sp="'+k+'" style="width:64px" value="'+f(v)+'">'+(unit?' '+unit:'')+'</span></label>';
    const selFld=(l,k,v,o)=>'<label class="f col">'+l+'<select class="num" data-sp="'+k+'">'+o.map(x=>'<option value="'+x[0]+'"'+(x[0]===v?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></label>';
    function stShape(){
      const st=stById(stCur),p=stState(st,'n');
      return stCur+'|'+stUseOf(st).join('')+'|'+(st&&st.anim||'')+(st&&st.anim==='custom'?':'+moOf(st).pp.join(',')+':'+moOf(st).ps.map(q=>q.t).join(',')+':'+moSelT(st):'')+'|'+(p?p.f+'|'+(p.g?1:0)+'|'+(p.sw>0?1:0)+'|'+(p.ia||'')+'|'+(p.ifit==='tile'?1:0)+'|'+fdOf(p).f:'-');
    }
    const SO_N={f:'fill',b:'border',g:'glow',o:'opacity',m:'blend',v:'fade',x:'transform',t:'transition',a:'animation',tx:'text'};
    const soSec=x=>stUseOf(x).concat(x.tx&&Object.keys(x.tx).length?['tx']:[]);
    const soOver=(a,b)=>{const B=soSec(b);return soSec(a).filter(k=>B.indexOf(k)>=0);};
    function soConf(L){
      const G=styles();
      for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)if(G.indexOf(L[i])>G.indexOf(L[j])&&soOver(L[i],L[j]).length)return true;
      return false;
    }
    function soAttr(k,D,x){
      const j=D.indexOf(x),c={};
      D.slice(0,j).forEach(y=>soOver(x,y).forEach(q=>{(c[q]=c[q]||[]).push(y.n||'(unnamed)');}));
      const t=Object.keys(c).map(q=>SO_N[q]+' from '+c[q].join(', ')).join('; ');
      return {a:' data-so="'+x.id+'" data-sok="'+esc(k)+'"',w:t?' <span class="sow" title="'+esc('Covered: '+t)+'">⚠</span>':''};
    }
    function soArr(k){
      const t=k.slice(0,2),id=k.slice(2);
      if(t==='o:'){const q=S.objects.find(o=>o.id===id);return q&&Array.isArray(q.sty)?q.sty:null;}
      if(t==='l:'){const b=bgOf(id);return b&&Array.isArray(b.sty)?b.sty:null;}
      const r=ruleOf(id);if(!r)return null;
      if(t==='r:')return rLook(r).sty;
      if(t==='a:'){const x=actSty(r);return x&&Array.isArray(x.sty)?x.sty:null;}
      return null;
    }
    function soMove(k,a,b){
      const A=soArr(k);if(!A)return;
      const D=idsStys(A).map(x=>x.id).reverse(),i=D.indexOf(a),j=D.indexOf(b);if(i<0||j<0||i===j)return;
      settle();D.splice(i,1);D.splice(j,0,a);A.splice(0,A.length,...D.reverse());render();store(true);
    }
    function stPanel(){
      if(stGrpCur){const k='g:'+stGrpCur;
        if(stKey!==k){stKey=k;E.stpanel.innerHTML='<div class="stw"><div class="stg stid"><label class="f col">group<input class="num" id="sgn" type="text" autocomplete="off" value="'+esc(stGrpCur)+'"></label>'+
          '<div class="row" style="margin-top:4px"><button class="btn" type="button" data-sgdel>Delete group</button></div></div></div>';}
        put(E.list,stRows());return;}
      if(!stById(stCur)){if(stKey!=='-'){stKey='-';E.stpanel.innerHTML='';}put(E.list,stRows());return;}
      const key=stShape();
      if(key!==stKey){stKey=key;stBuild();}
      else stRefresh();
    }
    const moT={};
    const moSelT=st=>{const t=moT[st.id];return moOf(st).ps.some(q=>q.t===t)?t:0;};
    function moAt(M,p,t){
      const L=M.ps;let i=0;while(i<L.length-2&&L[i+1].t<=t)i++;
      const a=L[i],b=L[i+1];if(PROPS[p]&&PROPS[p].c||b.t===a.t)return a.v[p];
      return a.v[p]+(b.v[p]-a.v[p])*(t-a.t)/(b.t-a.t);
    }
    function moColAt(M,t,p){
      p=p||'fc';const o=MO_A[p],L=M.ps;let i=0;while(i<L.length-2&&L[i+1].t<=t)i++;
      const a=L[i],b=L[i+1],k=b.t===a.t?0:clamp((t-a.t)/(b.t-a.t),0,1),A=hexRgb(a.v[p]),B=hexRgb(b.v[p]);
      return 'rgba('+A.map((v,j)=>Math.round(v+(B[j]-v)*k)).join(', ')+', '+f(a.v[o]+(b.v[o]-a.v[o])*k)+')';
    }
    const MO_G=[['Transform',['mx','my','mr','ms']],['Fill',['fc','fr']],['Opacity',['op']],['Border',['sw','sc']],['Text',['fs','ls']]];
    function anFields(st){
      let h='<label class="f col">type<select class="num" data-sg="anim">'+
        Object.keys(AN).map(k=>[k,AN[k].l]).map(x=>'<option value="'+x[0]+'"'+(x[0]===(st.anim||'')?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></label>';
      const T=AN[st.anim],aFld=(l,k,a,ph,unit)=>'<label class="f">'+l+'<span><input class="num" '+a+' data-sa="'+k+'" style="width:64px" placeholder="'+ph+'" value="'+anVal(st,k)+'">'+(unit?' '+unit:'')+'</span></label>';
      const cFld=(l,k,a,ph,unit)=>'<label class="f col">'+l+'<span class="mu"><input class="num" '+a+' data-sa="'+k+'" placeholder="'+ph+'" value="'+anVal(st,k)+'">'+(unit?'<i>'+unit+'</i>':'')+'</span></label>';
      if(T){
        h+='<div class="mrow">'+cFld('duration','ad','type="number" min="0.05" step="0.1"',f(T.d),'s')+
           cFld('repeat','ar','type="text" autocomplete="off" title="A number, or infinite"',T.r?String(T.r):'infinite','')+
           cFld('delay','al','type="number" min="0" step="0.1"','0','s')+'</div>';
        if(T.u)h+=aFld(T.u,'ai','type="number" min="0" step="1"',f(T.i),T.s);
        if(st.anim==='custom'){
          const M=moOf(st),t=moSelT(st),q=M.ps.filter(x=>x.t===t)[0],pv=moPv(st)||'c',sel=(a,L,v,x)=>'<select class="num'+(x||'')+'" '+a+'>'+L.join('')+'</select>';
          const opt=(v,l,on,off)=>'<option value="'+v+'"'+(on?' selected':'')+(off?' disabled':'')+'>'+l+'</option>';
          h+='<div class="mrow2"><div class="f col">pivot<div class="pvg" role="group" aria-label="Pivot">'+PIV.map(x=>'<button type="button" data-mopv="'+x[0]+'" title="'+x[1]+
            '" aria-label="'+x[1]+'" aria-pressed="'+(pv===x[0])+'"></button>').join('')+'</div></div><div class="mez">'+
            '<label class="f col">easing'+sel('data-sa="ae"',AN_E.map(x=>opt(x,x,x===(AN_E.indexOf(st.ae)>=0?st.ae:T.e))))+'</label>'+
            '<label class="chk" style="margin:0"><input type="checkbox" data-sa="ax"'+(st.ax?' checked':'')+'> back and forth</label></div></div>';
          h+='<h3 class="msec">Poses</h3><div class="ptabs" role="tablist" aria-label="Poses">'+M.ps.map((x,i)=>(i&&i%5===0?'<span class="pbr"></span>':'')+
            '<button type="button" class="pt" role="tab" data-mot="'+x.t+'" aria-selected="'+(x.t===t)+'"'+(x.t>0&&x.t<100?' title="Double-click to change the time"':'')+'>'+x.t+'%</button>').join('')+
            '<span class="pm"><button type="button" class="evb" data-moadd="1" title="Add a pose" aria-label="Add a pose">+</button>'+
            '<button type="button" class="evb" data-model="1" title="Delete pose" aria-label="Delete pose"'+(t>0&&t<100?'':' disabled')+'>−</button></span></div><div class="pbox" role="tabpanel">';
          const menu=p=>sel('data-mop="'+p+'" aria-label="Property"',MO_G.map(g=>'<optgroup label="'+g[0]+'">'+
            g[1].map(k=>opt(k,PROPS[k].l,k===p,k!==p&&M.pp.indexOf(k)>=0)).join('')+'</optgroup>'));
          M.pp.forEach(p=>{
            const P=PROPS[p],v=q.v[p],x=M.pp.length>1?'<button type="button" class="evb" data-mopx="'+p+'" title="Remove '+P.l+'" aria-label="Remove '+P.l+'">✕</button>':'';
            h+='<div class="prw">'+menu(p);
            if(P.c)h+='<span class="clr"><input type="color" data-mo="v:'+p+'" value="'+esc(v)+'" aria-label="'+P.l+'">'+
              '<input class="num" type="range" min="0" max="1" step="0.05" data-mo="v:'+MO_A[p]+'" value="'+q.v[MO_A[p]]+'" title="Color opacity" aria-label="Color opacity"></span>';
            else{
              if(p==='ms')h+=sel('data-sa="ay" aria-label="Axis"',[['','both'],['x','x'],['y','y']].map(y=>opt(y[0],y[1],y[0]===(st.ay==='x'||st.ay==='y'?st.ay:''))),' pax');
              h+='<input class="num" type="number" step="'+P.st+'" data-mo="v:'+p+'" value="'+f(v)+'" aria-label="'+P.l+'"><span class="pu">'+(P.u||'')+'</span>';
            }
            h+=x+'</div>';
          });
          const add=Object.keys(PROPS).filter(p=>M.pp.indexOf(p)<0);
          if(add.length)h+='<label class="f col">'+sel('data-moadd="p" aria-label="Add a property"',[plusOpt('+ property')].concat(MO_G.map(g=>
            g[1].filter(k=>add.indexOf(k)>=0).length?'<optgroup label="'+g[0]+'">'+g[1].filter(k=>add.indexOf(k)>=0).map(k=>opt(k,PROPS[k].l)).join('')+'</optgroup>':'')))+'</label>';
          h+='</div>';
        }
        if(st.anim==='color')h+='<div class="f">second color<span class="clr"><input type="color" data-sa="ac" value="'+esc(st.ac||'#e8a33d')+'" aria-label="Second color">'+
          '<input class="num" type="range" min="0" max="1" step="0.05" data-sa="aa" value="'+(st.aa==null?1:st.aa)+'" title="Color opacity" aria-label="Second color opacity"></span></div>';
      }
      return h;
    }
    function stBuild(){
      const st=stById(stCur),p=stState(st,'n'),el=stCur<0,U=stUseOf(st),on=k=>U.indexOf(k)>=0;
      if(isAn(st)){
        E.stpanel.innerHTML='<div class="stw"><div class="stg stid"><label class="f col">name<input class="num" id="stn" type="text" autocomplete="off" value="'+esc(st.n||'')+'"></label>'+
          '<p class="hint" id="stc" style="margin:-3px 0 8px"></p><div id="stsx">'+anSample(st)+'</div></div><div class="stg">'+anFields(st)+'</div></div>';
        E.stpanel.querySelector('#stsx')._h=anSample(st);
        stRefresh();return;
      }
      const sec=(k,t)=>'<h3>'+(stCur>0?'<label class="chk sec"><input type="checkbox" data-su="'+k+'"'+(on(k)?' checked':'')+'> '+t+'</label>':t)+'</h3>';
      let h='<div class="stw"><div class="stg stid">'+(stCur>0
        ?'<label class="f col">name<input class="num" id="stn" type="text" autocomplete="off" value="'+esc(st.n||'')+'"></label>'
        :'<h2 class="ttl" style="margin-bottom:4px">'+esc(stName(stCur).replace(/^d/,'D'))+'</h2>')+
        '<p class="hint" id="stc" style="margin:-3px 0 8px"></p>'+
        '<div id="stsx">'+stSample(st)+'</div></div><div class="stg">';
      h+=sec('f','Fill');
      if(on('f')){
        h+=selFld('type','f',p.f,[['n','none'],['c','color'],['l','linear gradient'],['r','radial gradient'],['k','conic gradient'],
          ['ps','stripes'],['pg','grid'],['pd','dots'],['pc','checks']].concat(stCur>0||p.f==='i'?[['i','image']]:[]));
        if(p.f==='i'){
          const tl=p.ia==='t',ti=p.ifit==='tile';
          h+='<label class="f col" style="margin-bottom:0">image</label>'+
             '<div class="prow"><input class="num" data-sp="ip" type="text" autocomplete="off" placeholder="immagini/night.jpg" aria-label="Style image path" value="'+esc(p.ip||'')+'">'+
             '<button class="btn" type="button" data-stbrowse="1">Browse…</button></div>'+
             '<p class="hint" id="stih" style="margin:0 0 8px">'+esc(stImgHint(p))+'</p>'+
             selFld('spread over','ia',p.ia||'',[['','shape'],['g','group'],['t','canvas']])+
             selFld('fit','ifit',p.ifit||'',(tl?[['','as background']]:[['','cover']]).concat(IFIT.filter(x=>tl||x[0]!=='cover'),[['tile','tile']]))+
             (ti?numFld('tile size','isz',tileW(p),'min="1" step="1"','px'):'');
        }
        const pt=isPat(p),gr=p.f==='l'||p.f==='r'||p.f==='k';
        if(p.f!=='n')h+=clrFld(p.f==='r'?'center color':p.f==='l'||p.f==='k'?'start color':p.f==='i'?'color (labels, icons)':'color','fc','fa',p);
        if(gr||pt)h+=clrFld(p.f==='r'?'edge color':p.f==='k'?'opposite color':pt?'background':'end color','fc2','fa2',p);
        if(p.f==='l'||p.f==='k'||pt)h+=numFld(p.f==='l'?'direction':p.f==='k'?'start':'angle','fg',p.fg,'step="15"','°');
        if(p.f==='k')h+='<div class="f">centre<div class="pvg" id="stfp" role="group" aria-label="Conic centre">'+PIV.map(q=>'<button type="button" data-stfp="'+q[0]+'" title="'+q[1]+'" aria-label="'+q[1]+'" aria-pressed="'+(fpOf(p)===q[0])+'"></button>').join('')+'</div></div>';
        if(pt)h+=numFld('size','pz',pzOf(p),'min="1" step="1"','px')+(p.f!=='pc'?numFld('thickness','pw',pwOf(p),'min="1" max="100" step="5"','%'):'');
        if(gr)h+=selFld('spread over','fsp',p.fsp||'',[['','shape'],['g','group'],['t','canvas']]);
        if(gr)h+='<label class="f">smooth<input class="num" type="range" min="0" max="1" step="0.05" data-sp="ft" value="'+ftOf(p)+'"></label>';
        if(!el&&p.f!=='i')h+='<label class="chk" style="margin-bottom:7px"><input type="checkbox" data-sg="hov"'+(st.hov?' checked':'')+'> lighten on hover</label>';
      }
      h+=sec('o','Opacity');
      if(on('o'))h+='<label class="f">opacity<input class="num" type="range" min="0" max="1" step="0.05" data-sp="op" value="'+p.op+'"></label>';
      if(stCur>0){
        h+=sec('m','Blend');
        if(on('m'))h+=selFld('blend mode','bm',bmOf(p),BLENDS.map(b=>[b,b]));
        h+=sec('v','Fade');
        if(on('v')){
          const q=fdOf(p),r=q.f==='r',rng=(l,k,v)=>'<label class="f">'+l+'<input class="num" type="range" min="0" max="1" step="0.05" data-sp="'+k+'" value="'+v+'"></label>';
          h+=selFld('type','vf',q.f,[['n','none'],['l','linear'],['r','radial']]);
          if(q.f!=='n')h+=selFld('anchor','vk',q.k,[['','follows shape'],['t','anchored to canvas']])+rng(r?'center':'start','va',q.a0)+rng(r?'edge':'end','va2',q.a1)+(r?'':numFld('direction','vg',q.g,'step="15"','°'))+
            numFld('position','vm',q.m,'min="0" max="100" step="5"','%')+rng('smooth','vt',q.t);
        }
      }
      h+='</div><div class="stg">';
      h+=sec('b',el?'Outline':'Border');
      if(on('b')){
        h+=numFld('width','sw',p.sw,'min="0" step="0.5"','');
        if(p.sw>0)h+=clrFld('color','sc','sa',p)+(el?'':selFld('line','sd',p.sd||'',[['','solid'],['d','dashed'],['p','dotted']]));
      }
      h+=sec('g','Glow');
      if(on('g')){
        h+='<label class="chk" style="margin-bottom:7px"><input type="checkbox" data-sp="g"'+(p.g?' checked':'')+'> glow or shadow</label>';
        if(p.g)h+=clrFld('color','gc','ga',p)+numFld('blur','gb',p.gb,'min="0" step="1"','')+
          numFld('offset x','gx',p.gx,'step="1"','')+numFld('offset y','gy',p.gy,'step="1"','');
      }
      h+='</div><div class="stg">';
      h+=sec('x','Transform');
      if(on('x'))h+=TF_K.map(k=>numFld(PROPS[k].l,k,tfNum(p,k),'step="'+PROPS[k].st+'"',PROPS[k].u)).join('');
      h+=sec('t','Transition');
      if(on('t'))h+='<label class="f">duration<span><input class="num" type="number" min="0" step="50" data-sg="dur" style="width:64px" value="'+(+st.dur||0)+'"> ms</span></label>';
      h+='</div>';
      if(stCur>0||stCur===-1){
        const t=txOf(st);
        h+='<div class="stg sub"><h2>Text'+(stCur>0?' (labels)':'')+'</h2>'+
          '<label class="f col">font<input class="num" data-stx="ff" type="text"'+pickAttrs('fonts','theme font')+' value="'+esc(t.ff||'')+'"></label>'+
          '<label class="f">size<span><input class="num" type="number" min="4" max="400" step="1" data-stx="fs" style="width:64px" placeholder="label" value="'+(t.fs?f(t.fs):'')+'"> px</span></label>'+
          '<label class="f col">weight<select class="num" data-stx="fw">'+[['','normal'],['300','light'],['500','medium'],['600','semibold'],['bold','bold']]
            .map(x=>'<option value="'+x[0]+'"'+(x[0]===(t.fw||'')?' selected':'')+'>'+x[1]+'</option>').join('')+'</select></label>'+
          '<div class="f">alignment<div class="seg" id="sta" role="group" aria-label="Text alignment">'+
            ALIGNS.map(a=>'<button type="button" data-sta="'+a[0]+'" aria-pressed="'+(a[0]===(t.ta||'middle'))+'" title="'+a[1]+'" aria-label="'+a[1]+'">'+
              '<svg viewBox="0 0 24 24"><path d="'+a[2]+'"/></svg></button>').join('')+'</div></div>'+
          '<label class="f">letter spacing<span><input class="num" type="number" step="0.5" data-stx="ls" style="width:64px" value="'+(t.ls?f(t.ls):'')+'"> px</span></label>'+
          '<label class="chk" style="margin-bottom:7px"><input type="checkbox" data-stx="fi"'+(t.fi?' checked':'')+'> italic</label>'+
          '<label class="chk"><input type="checkbox" data-stx="up"'+(t.up?' checked':'')+'> uppercase</label></div>';
      }
      h+='</div>';
      E.stpanel.innerHTML=h;
      const q=k=>E.stpanel.querySelector(k);
      q('#stsx')._h=stSample(st);
      stRefresh();
    }
    function stRefresh(){
      const st=stById(stCur);if(!st)return;
      const q=k=>E.stpanel.querySelector(k);
      put(E.list,stRows());
      let n=q('#stsx');if(n){const t=isAn(st)?anSample(st):stSample(st);if(n._h!==t){n._h=t;n.innerHTML=t;}}
      n=q('#stc');if(n){
        const u=useText(stUse(stCur),true),c=stCur>0?stIds().get(stCur):'';
        const t=isAn(st)?'Class '+c+' · '+u:stCur>0?'Class '+c+' · '+u+'. Partial: only the checked sections (none: transparent). Renaming changes the class.'
                     :'Rules '+(stCur===0?'.zone':stCur===-1?'.etichetta':'.icona')+' · '+u;
        if(n.textContent!==t)n.textContent=t;
      }
      n=q('#stn');if(n&&n!==root.activeElement&&n.value!==(st.n||''))n.value=st.n||'';
      const t=txOf(st);
      E.stpanel.querySelectorAll('[data-stx]').forEach(i=>{
        if(i===root.activeElement)return;
        const v=t[i.dataset.stx];
        if(i.type==='checkbox'){if(i.checked!==!!v)i.checked=!!v;}
        else{const w=v==null?'':String(typeof v==='number'?f(v):v);if(i.value!==w)i.value=w;}
      });
      E.stpanel.querySelectorAll('[data-sta]').forEach(b=>{const v=String(b.dataset.sta===(t.ta||'middle'));if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);});
      E.stpanel.querySelectorAll('[data-sa]').forEach(i=>{
        if(i===root.activeElement)return;
        const k=i.dataset.sa;
        if(i.type==='checkbox'){if(i.checked!==!!st[k])i.checked=!!st[k];return;}
        const w=k==='ac'?(st.ac||'#e8a33d'):k==='aa'?String(st.aa==null?1:st.aa):k==='ay'?(st.ay==='x'||st.ay==='y'?st.ay:''):
          k==='ae'?(AN_E.indexOf(st.ae)>=0?st.ae:AN.custom.e):anVal(st,k);
        if(i.value!==w)i.value=w;
      });
      if(st&&st.anim==='custom')E.stpanel.querySelectorAll('[data-mopv]').forEach(b=>{const v=String((moPv(st)||'c')===b.dataset.mopv);if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);});
      if(st&&st.anim==='custom')E.stpanel.querySelectorAll('[data-mo^="v:"]').forEach(i=>{
        if(i===root.activeElement)return;
        const p=i.dataset.mo.slice(2),q=moOf(st).ps.filter(x=>x.t===moSelT(st))[0];if(!q||!(p in q.v))return;
        const w=PROPS[p]&&PROPS[p].c?q.v[p]:String(p==='fa'||p==='sa'?q.v[p]:f(q.v[p]));if(i.value!==w)i.value=w;
      });
      const p=stState(st,'n');
      if(p)E.stpanel.querySelectorAll('[data-sp]').forEach(i=>{
        if(i===root.activeElement)return;
        const k=i.dataset.sp,v=k==='bm'?bmOf(p):k==='ft'?ftOf(p):k==='pz'?pzOf(p):k==='pw'?pwOf(p):k==='isz'?tileW(p):FD_K[k]?fdOf(p)[FD_K[k]]:p[k];
        if(i.type==='checkbox'){if(i.checked!==!!v)i.checked=!!v;}
        else{const t=v==null?'':String(typeof v==='number'?f(v):v);if(i.value!==t)i.value=t;}
      });
      const ih=q('#stih');if(ih&&p){const t=stImgHint(p);if(ih.textContent!==t)ih.textContent=t;}
      if(p)E.stpanel.querySelectorAll('[data-stfp]').forEach(b=>{const v=String(fpOf(p)===b.dataset.stfp);if(b.getAttribute('aria-pressed')!==v)b.setAttribute('aria-pressed',v);});
    }
    const stImgHint=p=>pLabel(p.ip||'','no image yet: zones show the color');
    function stNewId(){return styles().reduce((a,x)=>Math.max(a,(x&&x.id)||0),0)+1;}
    function stFreeName(b){let k=styles().length+1,n=b+' '+k;while(styles().some(x=>x&&x.n===n))n=b+' '+(++k);return n;}
    const SP_NUM={fa:[0,1],fa2:[0,1],ft:[0,1],pz:[1,1000],pw:[1,100],isz:[1,10000],sa:[0,1],ga:[0,1],op:[0,1],sw:[0,100],gb:[0,200],gx:[-500,500],gy:[-500,500],fg:[-3600,3600],va:[0,1],va2:[0,1],vg:[-3600,3600],vm:[0,100],vt:[0,1]};
    TF_K.forEach(k=>{SP_NUM[k]=[PROPS[k].a,PROPS[k].b];});
    function stInput(e,final){
      if(e.target.id==='sgn'){if(!final)sgRename(e.target.value);return;}
      const t=e.target,st=stById(stCur);if(!st)return;
      if(t.id==='stn'){if(stCur>0){st.n=t.value;render();store();}return;}
      if(t.dataset.su){
        settle();const x=stEdit(stCur),k=t.dataset.su,U=stUseOf(x).filter(j=>j!==k);
        if(t.checked)U.push(k);
        x.use=ST_SEC.filter(j=>U.indexOf(j)>=0);
        render();store(true);return;
      }
      const mo=t.dataset.mo,ma=t.dataset.moadd==='p',mp=t.dataset.mop;
      if(mo||ma||mp){
        const x=stEdit(stCur);if(!x||x.anim!=='custom'||!Array.isArray(x.ps))return;
        const sel=moSelT(x),q=x.ps.filter(y=>y.t===sel)[0];if(!q)return;
        const put=p=>{const P=PROPS[p];x.ps.forEach(y=>{y[p]=P.c?(y.t===100?P.v1:P.v0):+f(P.v0+(P.v1-P.v0)*y.t/100);if(MO_A[p])y[MO_A[p]]=1;});};
        if(ma||mp){
          if(!final)return;
          const p=t.value,M=moOf(x);if(!PROPS[p]||M.pp.indexOf(p)>=0){if(ma)t.value='';else t.value=mp;return;}
          settle();
          if(ma)x.pp=M.pp.concat([p]);
          else{if(M.pp.indexOf(mp)<0)return;x.pp=M.pp.map(k=>k===mp?p:k);x.ps.forEach(y=>{delete y[mp];if(MO_A[mp])delete y[MO_A[mp]];});if(mp==='ms')delete x.ay;}
          put(p);render();store(true);return;
        }
        if(mo==='t'){
          if(!final)return;
          const n=Math.round(parseFloat(t.value));
          if(!isFinite(n)||n<1||n>99||x.ps.some(y=>y.t===n)){t.value=sel;return;}
          settle();q.t=n;moT[x.id]=n;render();store(true);return;
        }
        const p=mo.slice(2),P=p==='fa'||p==='sa'?{a:0,b:1}:PROPS[p];if(!P||!(p in q))return;
        if(P.c){q[p]=t.value;render();store(!!final);return;}
        const n=parseFloat(t.value);
        if(!isFinite(n)){if(final)t.value=f(moOf(x).ps.filter(y=>y.t===sel)[0].v[p]);return;}
        q[p]=clamp(n,P.a,P.b);if(final)t.value=f(q[p]);
        render();store(!!final);return;
      }
      const ak=t.dataset.sa;
      if(ak){
        const x=stEdit(stCur);
        if(ak==='ac'){x.ac=t.value;render();store(!!final);return;}
        if((t.tagName==='SELECT'||t.type==='checkbox')&&!final)return;
        if(ak==='ay'){settle();if(t.value==='x'||t.value==='y')x.ay=t.value;else delete x.ay;render();store(true);return;}
        if(ak==='ae'){settle();if(t.value===AN.custom.e)delete x.ae;else x.ae=t.value;render();store(true);return;}
        if(ak==='ax'){settle();if(t.checked)x.ax=true;else delete x.ax;render();store(true);return;}
        const raw=t.value.trim();
        let v=null;
        if(ak==='ar')v=anRep(raw);
        else if(raw){const n=parseFloat(raw);if(isFinite(n))v=ak==='aa'?clamp(n,0,1):ak==='ad'?clamp(n,.05,600):ak==='al'?clamp(n,0,600):clamp(n,0,1000);}
        if(raw&&v==null&&!final)return;
        if(v==null)delete x[ak];else x[ak]=v;
        if(final&&ak!=='aa')t.value=anVal(x,ak);
        render();store(!!final);return;
      }
      const g=t.dataset.sg,k=t.dataset.sp,tk=t.dataset.stx;
      if(tk){
        const x=stEdit(stCur),tx=Object.assign({},x.tx||{});
        const disc=t.type==='checkbox'||t.tagName==='SELECT';
        if(disc)settle();
        if(t.type==='checkbox')tx[tk]=t.checked;
        else if(tk==='ff')tx.ff=txFont(t.value);
        else if(tk==='fw')tx.fw=t.value;
        else{const v=parseFloat(t.value);if(t.value.trim()&&isNaN(v))return;tx[tk]=isNaN(v)?0:v;}
        txSet(x,tx);
        render();store(disc||!!final);return;
      }
      if(g){
        const x=stEdit(stCur);
        if(g==='hov'){settle();x.hov=t.checked;render();store(true);return;}
        if(g==='anim'){settle();x.anim=t.value;delete x.ad;delete x.ai;render();store(true);return;}
        const v=parseFloat(t.value);if(isNaN(v))return;
        x.dur=clamp(Math.round(v),0,10000);render();store(!!final);return;
      }
      if(!k)return;
      const x=stEdit(stCur);
      let p=x.st.n;
      if(!p)p=x.st.n={};
      Object.keys(ST_P).forEach(j=>{if(p[j]===undefined)p[j]=ST_P[j];});
      if(t.type==='checkbox'){settle();p[k]=t.checked;render();store(true);return;}
      if(k==='ifit'){settle();if(t.value)p.ifit=t.value;else delete p.ifit;render();store(true);return;}
      if(k==='ia'){settle();if(t.value)p.ia=t.value;else delete p.ia;if(p.ifit!=='tile')delete p.ifit;render();store(true);return;}
      if(k==='fsp'){settle();if(t.value)p.fsp=t.value;else delete p.fsp;render();store(true);return;}
      if(k==='vk'){settle();if(t.value)p.vk=t.value;else delete p.vk;render();store(true);return;}
      if(t.tagName==='SELECT'){settle();p[k]=t.value;render();store(true);return;}
      if(t.type==='color'){p[k]=t.value;render();store(!!final);return;}
      if(k==='ip'){const v=t.value.trim();if(v)p.ip=v;else delete p.ip;delete p.iw;delete p.ih;render();store(!!final);return;}
      const v=parseFloat(t.value);if(isNaN(v))return;
      const r=SP_NUM[k];p[k]=r?clamp(v,r[0],r[1]):v;
      render();store(!!final);
    }
    function txSet(x,tx){
      const o=txOf({tx:tx});
      if(Object.keys(o).length)x.tx=o;else delete x.tx;
    }
    E.stpanel.addEventListener('input',e=>stInput(e,false));
    E.stpanel.addEventListener('change',e=>{const t=e.target;if(t.type==='color'||t.type==='range'||t.type==='number'||t.dataset.sa||t.dataset.moadd||t.dataset.mop)stInput(e,true);});
    let moDc=null;
    function moTime(t){
      const b=E.stpanel.querySelector('.ptabs [data-mot="'+t+'"]');if(!b)return;
      const i=document.createElement('input');
      i.className='num pte';i.type='number';i.min='1';i.max='99';i.step='1';i.dataset.mo='t';i.value=String(t);i.setAttribute('aria-label','Time');
      b.replaceWith(i);i.focus();i.select();
      i.addEventListener('keydown',k=>{if(k.key==='Escape'){i.value=String(t);i.blur();}else if(k.key==='Enter')i.blur();});
      i.addEventListener('blur',()=>setTimeout(()=>{if(i.isConnected){stKey='';render();}},0));
    }
    let sod=null;
    const scrollerOf=n=>{for(let c=n.parentNode;c&&c.nodeType===1;c=c.parentNode){const o=getComputedStyle(c).overflowY;if((o==='auto'||o==='scroll')&&c.scrollHeight>c.clientHeight)return c;}return null;};
    E.detail.addEventListener('pointerdown',e=>{
      const r=e.target.closest('[data-so]');if(!r||e.button>0||e.target.closest('button,select,input'))return;
      if(r.parentNode.querySelectorAll('[data-so][data-sok="'+r.dataset.sok+'"]').length<2)return;
      const d=sod={id:e.pointerId,r:r,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,live:false,tg:null,raf:0};
      d.t=setTimeout(()=>{if(sod!==d)return;d.live=true;r.classList.add('sod');d.sc=scrollerOf(r);
        try{r.setPointerCapture(d.id);}catch(_){}try{if(navigator.vibrate)navigator.vibrate(10);}catch(_){}},e.pointerType==='mouse'?250:HOLD);
    });
    function soTrack(){
      const d=sod;if(!d||!d.live)return;
      const el=(root.elementFromPoint?root.elementFromPoint(d.x,d.y):null),t=el&&el.closest?el.closest('[data-so]'):null;
      const ok=t&&t!==d.r&&t.dataset.sok===d.r.dataset.sok?t:null;
      if(ok!==d.tg){if(d.tg)d.tg.classList.remove('sot','dn');d.tg=ok;if(ok)ok.classList.add('sot');}
      if(ok)ok.classList.toggle('dn',!!(d.r.compareDocumentPosition(ok)&4));
    }
    E.detail.addEventListener('pointermove',e=>{
      const d=sod;if(!d||e.pointerId!==d.id)return;
      d.x=e.clientX;d.y=e.clientY;
      if(!d.live){if(Math.abs(e.clientX-d.sx)+Math.abs(e.clientY-d.sy)>(e.pointerType==='mouse'?4:8)){clearTimeout(d.t);sod=null;}return;}
      soTrack();if(!d.raf&&d.sc)d.raf=requestAnimationFrame(()=>dragAuto(d,d.sc,soTrack));
    });
    const soEnd=e=>{
      const d=sod;if(!d||(e&&e.pointerId!==d.id))return;
      sod=null;d.end=true;clearTimeout(d.t);if(d.raf)cancelAnimationFrame(d.raf);if(!d.live)return;
      d.r.classList.remove('sod');if(d.tg){d.tg.classList.remove('sot','dn');soMove(d.r.dataset.sok,+d.r.dataset.so,+d.tg.dataset.so);}
    };
    E.detail.addEventListener('pointerup',soEnd);E.detail.addEventListener('pointercancel',soEnd);
    E.detail.addEventListener('touchmove',e=>{if(sod&&sod.live&&e.cancelable)e.preventDefault();},{passive:false});
    E.detail.addEventListener('contextmenu',e=>{if(sod)e.preventDefault();});
    E.ltab.addEventListener('click',e=>{
      const b=e.target.closest('[data-tab]');if(!b)return;
      const t=b.dataset.tab,v=t==='s'||t==='a',u=t==='r',x=t==='t';if(v===selSt&&(!v||stAn===(t==='a'))&&u===selRu&&x===selTe)return;
      stAn=t==='a';stGrpCur='';
      selSt=v;selRu=u;selTe=x;if(v)stMs=[];selBg=false;selG=-1;
      E.list.scrollTop=0;lastShown='';render();
    });
    E.tepanel.addEventListener('input',e=>{
      const t=e.target.closest('[data-tsim]');if(!t)return;
      const [en,w]=t.dataset.tsim.split('|');simPut(en,w,t.value);render();store();
    });
    E.tepanel.addEventListener('change',e=>{if(e.target.closest('[data-tsim]'))store(true);});
    E.tepanel.addEventListener('click',e=>{
      const tx=e.target.closest('[data-tclr]');
      if(tx){const [en,w]=tx.dataset.tclr.split('|');settle();simPut(en,w,'');render();store(true);return;}
      const tc=e.target.closest('[data-tca]');if(tc){ruOpen(tc.dataset.tca);return;}
      const to=e.target.closest('[data-tob]');if(!to)return;
      const x=teEnts().get(teCur),q=x&&teTargets(x.c)[+to.dataset.tob];if(!q)return;
      const o=q.o;
      if(isBgl(o)){pick([]);selGrp=null;selTe=false;selBg=true;selPg=false;selG=-1;lastShown='';render();return;}
      if(isGrp(o)){pickG(members(o.id),o.id);render();return;}
      pick([o]);selGrp=null;render();
    });
    E.tbar.addEventListener('click',e=>{
      const b=e.target.closest('[data-tb]');if(!b||b.disabled)return;
      if(b.dataset.tb==='real'&&(S.sim||S.clk)){clkStop();settle();delete S.sim;delete S.clk;render();store(true);}
    });
    E.sbar.addEventListener('click',e=>{const b=e.target.closest('[data-sb]');if(b&&!b.disabled)stAct(b.dataset.sb==='new'&&stAn?'newa':b.dataset.sb);});
    function sbarNames(){
      const w=stAn?'motion':'style';
      [['new','New '+w],['dup','Duplicate '+w],['del','Delete '+w]].forEach(([k,t])=>{const b=E.sbar.querySelector('[data-sb="'+k+'"]');if(b.title!==t){b.title=t;b.setAttribute('aria-label',t);}});
    }
    function sbarRefresh(){E.sbar.querySelectorAll('[data-sb="del"],[data-sb="dup"]').forEach(d=>{const x=d.dataset.sb==='del'?!stGrpCur&&!stById(stCur):!!stGrpCur||!stById(stCur);if(d.disabled!==x)d.disabled=x;});}
    function sgRename(v){
      v=String(v||'').trim();const o=stGrpCur,G=SGR();if(!o||!v||v===o||G.indexOf(v)>=0)return;
      G[G.indexOf(o)]=v;styles().forEach(x=>{if(x&&stGrp(x)===o)x.g=v;});
      const fd=fold();if(fd.has('S:'+o)){fd.delete('S:'+o);fd.add('S:'+v);foldSave();}
      stGrpCur=v;stKey='g:'+v;render();store();
    }
    function sgDel(g){settle();styles().forEach(x=>{if(x&&stGrp(x)===g)delete x.g;});S.sgr=SGR().filter(x=>x!==g);if(!S.sgr.length)delete S.sgr;stGrpCur='';render();store(true);}
    E.stpanel.addEventListener('click',e=>{
      if(e.target.closest('[data-sgdel]')){if(stGrpCur)sgDel(stGrpCur);return;}
      if(e.target.closest('[data-stbrowse]')){if(stCur>0)galOpen({stId:stCur});return;}
      const mb=e.target.closest('[data-mopv],[data-mot],[data-moadd="1"],[data-model],[data-mopx]');
      if(mb){
        const x=stEdit(stCur);if(!x||x.anim!=='custom'||!Array.isArray(x.ps))return;
        const M=moOf(x),sel=moSelT(x),d=mb.dataset;
        if(d.mot!=null){
          const tt=+d.mot,now=performance.now();
          if(moDc&&moDc.id===x.id&&moDc.t===tt&&now-moDc.at<350&&tt>0&&tt<100){moDc=null;moTime(tt);return;}
          moDc={id:x.id,t:tt,at:now};moT[x.id]=tt;render();return;
        }
        settle();
        if(d.mopv){if(d.mopv==='c')delete x.pv;else x.pv=d.mopv;}
        else if(d.moadd){
          const i=M.ps.findIndex(q=>q.t===sel),a=M.ps[i<M.ps.length-1?i:i-1],b=M.ps[i<M.ps.length-1?i+1:i],t=Math.round((a.t+b.t)/2);
          if(t===a.t||t===b.t)return;
          const q={t:t};M.pp.forEach(p=>{q[p]=moAt(M,p,t);if(!PROPS[p].c)q[p]=+f(q[p]);});M.pp.forEach(p=>{if(MO_A[p])q[MO_A[p]]=+f(moAt(M,MO_A[p],t));});
          x.ps.push(q);x.ps.sort((u,v)=>u.t-v.t);moT[x.id]=t;
        }
        else if(d.model!=null){
          if(sel===0||sel===100)return;
          const i=M.ps.findIndex(q=>q.t===sel);x.ps=x.ps.filter(q=>q.t!==sel);moT[x.id]=M.ps[i-1].t;
        }
        else if(d.mopx){
          if(M.pp.length<2)return;
          x.pp=M.pp.filter(p=>p!==d.mopx);x.ps.forEach(q=>{delete q[d.mopx];if(MO_A[d.mopx])delete q[MO_A[d.mopx]];});if(d.mopx==='ms')delete x.ay;
        }
        render();store(true);return;
      }
      const fp=e.target.closest('[data-stfp]');
      if(fp){
        const x=stEdit(stCur),p=x.st.n,v=fp.dataset.stfp;
        if(fpOf(p)===v)return;
        settle();if(v==='c')delete p.fp;else p.fp=v;render();store(true);return;
      }
      const ta=e.target.closest('[data-sta]');
      if(ta){
        settle();const x=stEdit(stCur),tx=Object.assign({},x.tx||{});
        tx.ta=ta.dataset.sta==='middle'?'':ta.dataset.sta;
        txSet(x,tx);render();store(true);return;
      }
    });
    function stAct(w){
      settle();
      if(w==='newg'){let n=1;while(SGR().indexOf('Group '+n)>=0)n++;if(!Array.isArray(S.sgr))S.sgr=[];S.sgr.push('Group '+n);stGrpCur='Group '+n;render();store(true);
        const i=E.stpanel.querySelector('#sgn');if(i&&!coarse){i.focus();i.select();}return;}
      if(stGrpCur&&(w==='del'||w==='dup')){if(w==='del')sgDel(stGrpCur);return;}
      if(w==='new'||w==='newa')stGrpCur='';
      if(w==='new'||w==='newa'||w==='dup'){
        const src=stById(stCur),id=stNewId();if(w==='dup'&&!src)return;
        const x=w==='new'?newStyle(id,stFreeName('Style')):w==='newa'?newAnim(id,stFreeName('Motion'))
                        :Object.assign(clone(src),{id:id,n:(stCur>0?(src.n||'Style'):stName(stCur).replace(/^d/,'D'))+' copy'});
        if(!Array.isArray(S.styles))S.styles=[];
        S.styles.push(x);stCur=id;render();store(true);
        const n=E.stpanel.querySelector('#stn');if(n&&!coarse){n.focus();n.select();}
        return;
      }
      if(w==='del'&&stCur>0){
        const u=stUse(stCur),n=u.z+u.l+u.i+u.c+u.b+u.r;
        if(n&&!confirm('Delete '+(isAn(stById(stCur))?'motion':'style')+' “'+stName(stCur)+'”? '+useText(u)+' will lose it.'))return;
        const id=stCur;
        RULS().forEach(r=>(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{if(x&&Array.isArray(x.sty))x.sty=x.sty.filter(v=>v!==id);if(x&&Array.isArray(x.mo))x.mo=x.mo.filter(v=>v!==id);}));
        S.objects.concat(BGS()).forEach(s=>setSty(s,id,false));
        S.styles=styles().filter(x=>x&&x.id!==id);
        if(!S.styles.length)delete S.styles;
        const x=styles().find(Boolean);stCur=x?x.id:0;render();store(true);
      }
    }
    function styRows(key,has,tot,obj){
      const L=styles().filter(Boolean),on=obj?stysOf(obj).slice().reverse():stSorted(L.filter(x=>has(x)>0));
      let h='';
      [['s',x=>!isAn(x)],['a',isAn]].forEach(([kd,ok])=>{
        const D=on.filter(ok),w=kd==='a'?'motion':'style';
        h+=D.map(x=>{const n=has(x),A=obj?soAttr('o:'+obj.id,D,x):{a:'',w:''};
          return '<div class="slr sty" data-lk="'+key+'"'+A.a+'><span class="nm">'+esc(x.n||'(unnamed)')+(n<tot?' <i>('+n+' of '+tot+')</i>':'')+A.w+'</span>'+
            '<button class="btn" type="button" data-sted="'+x.id+'">Edit</button><button type="button" class="evb" data-lkdel="'+x.id+'" title="Remove '+w+'" aria-label="Remove '+w+'">✕</button></div>';}).join('');
        const off=L.filter(x=>ok(x)&&has(x)<tot);
        h+='<select class="num lkadd stadd" data-lk="'+key+'" aria-label="Add '+w+'">'+lookOpts(off,true,kd)+'</select>';
      });
      return h;
    }
    function lookHTML(list){
      if(!list.length)return '';
      return tbx('Base look',styRows('b',x=>list.filter(q=>styIds(q).indexOf(x.id)>=0).length,list.length,list.length===1?list[0]:null));
    }
    function tbx(t,c,a,f){return '<div class="tbx"'+(a||'')+'><h3>'+t+'</h3><div class="tbb">'+c+'</div>'+(f||'')+'</div>';}
    const lookBox=list=>'<div id="lkb">'+lookHTML(list)+'</div>';
    function lkSet(k,id,on){
      if(k==='b')lookList().forEach(q=>setSty(q,id,on));
    }
    const lookList=()=>selGrp!=null&&grpOf(selGrp)?members(selGrp):ms.slice();
    function sidesN(){return Math.max(3,Math.min(64,Math.round(+S.sides)||6));}
    function clampShape(s,k){
      if(k==='sides')s.sides=Math.max(3,Math.min(64,Math.round(s.sides)));
      else if(k==='dec')s.dec=Math.max(-1,Math.min(4,Math.round(s.dec)));
      else if(k==='size'&&isEl(s))s.size=Math.max(s.t==='label'?6:8,Math.min(400,s.size));
      else if(k==='w'||k==='h'||k==='rr')s[k]=Math.max(1,s[k]);
      else if(k==='r'||k==='dur')s[k]=Math.max(0,s[k]);
      else if(k==='r1')s.r1=Math.max(0,Math.min(s.r2-1,s.r1));
      else if(k==='tw')s.tw=Math.max(1,s.tw);
      else if(k==='lw')s.lw=Math.max(.5,Math.min(50,s.lw));
      else if(k==='dot')s.dot=Math.max(0,Math.min(200,Math.round(s.dot*2)/2));
      else if(k==='tb')s[k]=Math.max(0,Math.min(1,s[k]));
      else if(k==='bend')s.bend=Math.max(-.5,Math.min(.5,s.bend));
      else if(k==='r2')s.r2=Math.max(s.r1+1,s.r2);
    }

    const TXT=/^(n|txt|icon|body|tail|lo)$/;
    $('#insp').addEventListener('input',e=>{
      const t=e.target;
      if(t.dataset.lve){lvInput(t);return;}
      if(t.dataset.bhe!=null){bhInput(t);return;}
      if(t.id==='gname'){const G=grpOf(selGrp);if(G){G.n=t.value;render();store();}return;}
      if(t.dataset.psz)return;
      if(t.dataset.pos){
        const v=parseFloat(t.value),L=posList(),M=movers(L);if(isNaN(v)||!M.length)return;
        const b=bboxOf(L),d=Math.round(v-(t.dataset.pos==='x'?b.x0:b.y0));if(!d)return;
        M.forEach(q=>move(q,t.dataset.pos==='x'?d:0,t.dataset.pos==='y'?d:0));render();store();return;
      }
      if(t.classList.contains('lkadd')){
        const v=t.value,nw=v==='+'||v==='+a';if(!nw&&!+v)return;
        settle();const id=stMake(v);lkSet(t.dataset.lk,id,true);
        if(nw){stCur=id;stGrpCur='';stAn=isAn(stById(id));stMs=ms.slice();selBg=false;selSt=true;selRu=false;selTe=false;}
        render();store(true);return;
      }
      if(t.dataset.ki==='p'){
        const s0=sel>=0&&S.objects[sel];if(!s0||isEl(s0))return;
        const s=curPh(s0),I=IMW(s),v=t.value.trim();
        if(v)I.p=v;else delete I.p;
        if(!Object.keys(I).length&&s===s0&&!s0.imx)delete s0.img;
        render();store();return;
      }
      if(t.dataset.phn){
        const s0=sel>=0&&S.objects[sel];if(!s0||isEl(s0))return;
        const I=IMW(curPh(s0)),v=t.value.replace(/[\r\n]+/g,' '),old=phName(s0,I);
        if(v.trim())I.n=v;else delete I.n;
        const nw=phName(s0,I);
        if(nw!==old&&!S.objects.some(z=>phAll(z).some(q=>q!==I&&phName(z,q)===old)))
          RULS().forEach(r=>(Array.isArray(r.fx)?r.fx:[]).forEach(x=>{if(x&&x.k==='pho'&&x.n===old)x.n=nw;if(x&&x.k==='follow'&&x.ph===old)x.ph=nw;}));
        render();store();return;
      }
      if(t.dataset.ib){
        const s0=sel>=0&&S.objects[sel];if(!s0||isEl(s0))return;
        const s=curPh(s0);
        if(t.dataset.ib==='fit'){
          const I=IMW(s);
          if(I.follow)I.fit=t.value;
          else if(t.value)I.tfit=t.value;else delete I.tfit;
          render();store();return;
        }
        const v=parseFloat(t.value);if(isNaN(v))return;
        const b=ibox(s).slice(),w=t.dataset.ib;
        if(w==='z'){const z=Math.max(1,v)/100,k=z/b[2];b[2]=z;b[3]*=k;}
        else if(w==='w'||w==='h'){const F=ibRef(s);if(w==='w')b[2]=Math.max(1,iv(v))/F.w;else b[3]=Math.max(1,iv(v))/F.h;}
        else{const F=ibRef(s);if(w==='x')b[0]=.5+iv(v)/F.w;else b[1]=.5+iv(v)/F.h;}
        IMW(s)[boxKey(s)]=b.map(IBPX(w)?(r=>Math.round(r*1e6)/1e6):r4);render();store();return;
      }
      const k=t.dataset.k;if(k===undefined||sel<0)return;
      const s=S.objects[sel];if(!s)return;
      if(s.t==='line'&&LN_K.test(k)){if(lnSet(s,k,t)){render();store();}return;}
      if(k==='txt'){const v=t.value.replace(/[\r\n]+/g,' ');if(v)s.txt=v;else delete s.txt;}
      else if(k==='n'){const v=t.value.replace(/[\r\n]+/g,' ');if(!v.trim())return;s.n=v;}
      else if(TXT.test(k))s[k]=t.value;
      else if(k==='dot'&&t.value.trim()==='')delete s.dot;
      else{
        const v=parseFloat(t.value);
        if(isNaN(v))return;
        s[k]=v;clampShape(s,k);intS(s);
      }
      if(k==='sides'&&s.t==='reg')S.sides=s.sides;
      if(k==='tail'&&s.tail==='curved'&&!s.bend)s.bend=.2;
      if(k==='lo'&&s.t==='callout'){
        const c=centre(s),L=Math.abs(s.lo==='v'?s.w:s.h);
        if(s.lo==='v'){s.x=c.x;s.w=0;s.y=c.y-L/2;s.h=L;}else{s.y=c.y;s.h=0;s.x=c.x-L/2;s.w=L;}
        if(s.lo!=='v')delete s.lo;
        intS(s);
      }
      if(k==='body'&&s.t==='callout'){
        if(s.body!=='line'&&(!s.w||!s.h)){
          if(!s.h){const d=Math.max(20,Math.round(Math.abs(s.w)*.4));s.y-=d/2;s.h=d;}
          else{const d=Math.max(20,Math.round(Math.abs(s.h)*.4));s.x-=d/2;s.w=d;}
          delete s.lo;
        }
        intS(s);
      }
      render();store();
    });
    $('#insp').addEventListener('change',e=>{
      const t=e.target,s=sel>=0&&S.objects[sel];
      if(t.dataset.psz){
        const L=posList(),M=movers(L),v=parseFloat(t.value);
        if(!L.length||isNaN(v)||v<1){syncFields();return;}
        if(M.length<L.length){stamp('locked items: nothing scaled',true);syncFields();return;}
        const b=bboxOf(L),cur=t.dataset.pos==='w'?b.x1-b.x0:b.y1-b.y0;
        if(!(cur>0)||Math.round(cur)===Math.round(v))return;
        settle();scaleList(L,v/cur,b.x0,b.y0);render();store(true);return;
      }
      if(s&&t.dataset.k==='n'&&!t.value.trim())t.value=s.n||'';
      if(t.dataset.lve==='e')lvInput(t,true);
      if(t.dataset.bhe!=null)bhInput(t,true);
    });
    $('#insp').addEventListener('click',e=>{
      const tb=e.target.closest('.itabs [data-itab]');
      if(tb){setITab(tb.dataset.itab);return;}
      if(e.target.closest('[data-bh="rule"]')){ruleNew(selUnitIds());return;}
      if(e.target.closest('[data-bh="rep"]')){const o=bhTarget();bhRep=o&&bhRep!==o.id?o.id:null;bhPanel();return;}
      const lv=e.target.closest('[data-lv]');
      if(lv){
        const s=sel>=0&&S.objects[sel];if(!s||s.t!=='label'||lv.disabled)return;
        if(lv.dataset.lv==='1'){
          if(lvRule(s))return;
          lvFor=s.id;lvE='';lvPanel();
          const i=E.insp.querySelector('[data-lve="e"]');if(i){if(!coarse)i.focus();pickOpen(i);}
          return;
        }
        lvFor=null;lvE='';
        if(RULS().some(r=>rKind(r)==='data'&&rFol(r)&&rFol(r).p==='text'&&rOn(r).indexOf(s.id)>=0)){settle();lvClear(s);render();store(true);}
        else lvPanel();
        return;
      }
      const bh=e.target.closest('[data-ru]');
      if(bh){ruOpen(bh.dataset.ru);return;}
      const ld=e.target.closest('[data-lkdel]');
      if(ld){const row=ld.closest('[data-lk]');settle();lkSet(row.dataset.lk,+ld.dataset.lkdel,false);render();store(true);return;}
      const se=e.target.closest('[data-sted]');
      if(se){stCur=+se.dataset.sted;stGrpCur='';stAn=isAn(stById(stCur));stMs=ms.slice();selBg=false;selSt=true;selRu=false;selTe=false;render();return;}
      if(e.target.closest('[data-browse]')){const s=sel>=0&&S.objects[sel];if(s&&!isEl(s))galOpen(curPh(s));return;}
      const im=e.target.closest('[data-im]');
      if(im){
        const s0=sel>=0&&S.objects[sel],s=s0&&!isEl(s0)?curPh(s0):null;
        if(s&&(im.dataset.im==='1')!==!!IM(s).follow){settle();setFollow(s,im.dataset.im==='1');render();store(true);}
        return;
      }
      const pr=e.target.closest('[data-pho],[data-pha]');
      if(pr&&!pr.disabled){
        const s=sel>=0&&S.objects[sel];if(!s||isEl(s))return;
        const A=phAll(s),row=pr.closest('[data-phi]'),i=row?+row.dataset.phi:-1;
        if(pr.dataset.pho!=null){const k=+pr.dataset.pho;phCur.set(s.id,phOpen(s)===k?-1:k);inspObj=null;render();return;}
        const w=pr.dataset.pha;
        if(w==='add'){
          settle();
          let k=A.length+1;const N=A.map(q=>phName(s,q));while(N.indexOf('Photo '+k)>=0)k++;
          const I={n:'Photo '+k};phSet(s,A.concat([I]));phCur.set(s.id,A.length);inspObj=null;render();store(true);
          galOpen(phView(s,I));return;
        }
        if(i<0||!A[i])return;
        settle();
        const o=phOpen(s);
        if(w==='del'){A.splice(i,1);phSet(s,A);phCur.set(s.id,o===i?-1:o>i?o-1:o);}
        else{const j=i+(w==='up'?-1:1);if(j<0||j>=A.length)return;const q=A[i];A[i]=A[j];A[j]=q;phSet(s,A);if(o===i)phCur.set(s.id,j);else if(o===j)phCur.set(s.id,i);}
        inspObj=null;render();store(true);return;
      }
      const b=e.target.closest('[data-z],#rep');if(!b)return;
      if(b.dataset.z){zAct(b.dataset.z);return;}
      if(b.id==='rep'&&sel>=0){
        settle();
        const s=S.objects[sel],n=+$('#rn').value||4,g=+$('#rg').value||0,stp=360/n,base=s.a0;
        const at=sel,made=[s];
        Object.assign(s,{a0:base+g/2,a1:base+stp-g/2});
        for(let i=1;i<n;i++){
          const c=clone(s);c.a0=base+i*stp+g/2;c.a1=base+(i+1)*stp-g/2;c.n=copyName(c);
          add(c,true,at+i);joinRules(s.id,c.id);made.push(c);
        }
        pick(made);render();store(true);
      }
    });
    function zAct(z){
      settle();
      if(z&&selGrp!=null){
        const id=selGrp;
        if(z==='gdel')ungroup([id]);
        if(z==='dup')dupSel();
        if((z==='gup'||z==='gdown')&&shiftUnit(members(id)[0],z==='gup'?1:-1,gpar(id))){render();store(true);}
        return;
      }
      if(z&&ms.length>1){
        if(z==='grp')groupSel();
        if(z==='del')delSel();
        if(z==='dup')dupSel();
        if(z==='none'){pick([]);render();}
        return;
      }
      if(z&&sel>=0){
        const s=S.objects[sel];
        if(z==='del'){delSel();return;}
        if(z==='dup'){dupSel();return;}
        if(z==='ifit'){fitShape(curPh(s));render();store(true);return;}
        if(z==='isize'){
          const m=E.insp.querySelector('#iszs'),pth=(m&&m.value)||IM(curPh(s)).p,d=pth&&dims.get(full(pth));
          if(!d||!d.w||!d.h){stamp('image size unknown',true);return;}
          sizeToImg(s,d.w,d.h,phAll(s).find(I=>I.p===pth)||false);render();store(true);return;
        }
        if(z==='free'&&s.t==='reg'){
          const RR=phAll(s).map(I=>I.follow?imgRect(phView(s,I)):null);
          const c=Object.assign({},s,{t:'poly',p:ptsOf(s).map(q=>({x:f(q.x),y:f(q.y)}))});
          delete c.cx;delete c.cy;delete c.rr;delete c.sides;delete c.rot;
          if(RR.some(Boolean)){
            const A=phAll(s).map(clone);
            A.forEach((I,i)=>{if(RR[i])I.box=boxFor(c,RR[i]);});
            phSet(c,A);
          }
          S.objects[sel]=c;pick([c]);render();store(true);return;
        }
        if(z==='up'||z==='down')nudge(s,z==='up'?1:-1);
        render();store(true);return;
      }
    }
    $('#ibar').addEventListener('click',e=>{
      const b=e.target.closest('[data-ib-z]');if(!b||b.disabled)return;
      const z=b.dataset.ibZ,G=selGrp!=null&&grpOf(selGrp);
      if(G)zAct(z==='up'?'gup':z==='down'?'gdown':z==='del'?'gdel':z);
      else zAct(z);
    });
    function ibarRefresh(){
      const G=selGrp!=null&&!!grpOf(selGrp),one=!G&&ms.length===1&&sel>=0,any=G||ms.length>0;
      E.ibar.querySelectorAll('[data-ib-z]').forEach(n=>{
        const z=n.dataset.ibZ,on=(z==='up'||z==='down')?(G||one):any;
        if(n.disabled===on)n.disabled=!on;
        if(z==='del'){const t=G?'Ungroup':'Delete';if(n.title!==t){n.title=t;n.setAttribute('aria-label',t);}}
      });
    }
    $('#list').addEventListener('click',e=>{
      if(skipClick){skipClick=false;return;}
      const lb=e.target.closest('[data-lkb]');
      if(lb){
        const k=lb.dataset.lkb,q=k[0]==='g'?grpOf(k.slice(1)):S.objects[+k.slice(1)];
        if(q){settle();if(q.lk)delete q.lk;else q.lk=true;hovG=null;render();store(true);}
        return;
      }
      const eb=e.target.closest('[data-ehb]');
      if(eb){
        const k=eb.dataset.ehb,q=k[0]==='g'?grpOf(k.slice(1)):S.objects[+k.slice(1)],H=hidS();
        if(q){if(H.has(q.id))H.delete(q.id);else H.add(q.id);hovG=null;render();}
        return;
      }
      const fb=e.target.closest('[data-fold]');
      if(fb){const id=fb.dataset.fold,fd=fold();if(fd.has(id))fd.delete(id);else fd.add(id);foldSave();render();return;}
      const sgh=e.target.closest('[data-sg]');if(sgh){stGrpCur=sgh.dataset.sg;render();return;}
      const sr=e.target.closest('[data-sr]');
      if(sr){stCur=+sr.dataset.sr;stGrpCur='';render();return;}
      const te=e.target.closest('[data-te]');
      if(te){teCur=te.dataset.te;render();return;}
      const rby=e.target.closest('[data-ruby]');
      if(rby){ruBy=rby.dataset.ruby;ruSeen='';try{localStorage.setItem(KEY+'-ruby',ruBy);}catch(_){}render();return;}
      const rf=e.target.closest('[data-ruf]');
      if(rf){const id=rf.dataset.ruf;if(ruOp.has(id))ruOp.delete(id);else ruOp.add(id);render();return;}
      const ru=e.target.closest('[data-ru],[data-ca]');
      if(ru){ruCur=ru.dataset.ru||ru.dataset.ca;if(ru.dataset.ca)ruOp.add(ru.dataset.ca);render();return;}
      const b=e.target.closest('[data-proj],[data-bg],[data-pg],[data-i],[data-gr]');if(!b)return;
      selG=-1;
      if(b.dataset.proj){gIn=null;pick([]);selBg=false;render();return;}
      if(b.dataset.bg){gIn=null;pick([]);selBg=true;selPg=false;render();return;}
      if(b.dataset.pg){gIn=null;pick([]);selBg=true;selPg=true;render();return;}
      const add=e.ctrlKey||e.metaKey||msel;
      if(e.shiftKey&&listRange(b)){render();return;}
      if(b.dataset.gr!=null||b.dataset.i!=null)lAnc=b.dataset.gr!=null?'g'+b.dataset.gr:(S.objects[+b.dataset.i]||{}).id;
      if(b.dataset.gr!=null){
        const id=b.dataset.gr,m=members(id);if(!m.length)return;
        gIn=gpar(id);selBg=false;
        if(add){
          const all=m.every(isSel);
          pick(all?ms.filter(q=>m.indexOf(q)<0):ms.concat(m.filter(q=>!isSel(q))));
          selGrp=exactGrp();resel();
        }
        else pickG(m,id);
      }
      else{
        const s=S.objects[+b.dataset.i];if(!s)return;
        selBg=false;
        if(add&&s.g!=null&&selGrp!=null&&inG(s,selGrp)){gIn=s.g;pickG([s],null);}
        else{
          pickG(!add?[s]:isSel(s)?ms.filter(q=>q!==s):ms.concat([s]),null);
          gIn=ms.length?commonG(ms.map(q=>q.g==null?null:q.g)):null;resel();
        }
      }
      render();
    });
    function listRange(b){
      const rows=listRows(),key=r=>r.dataset.gr!=null?'g'+r.dataset.gr:(S.objects[+r.dataset.i]||{}).id;
      const i=rows.findIndex(r=>key(r)===lAnc),j=rows.indexOf(b);
      if(i<0||j<0)return false;
      const L=[];
      rows.slice(Math.min(i,j),Math.max(i,j)+1).forEach(r=>{
        (r.dataset.gr!=null?members(r.dataset.gr):[S.objects[+r.dataset.i]]).forEach(q=>{if(q&&L.indexOf(q)<0)L.push(q);});
      });
      if(!L.length)return false;
      selBg=false;pickG(L,null);selGrp=exactGrp();
      gIn=commonG(ms.map(q=>q.g==null?null:q.g));resel();
      return true;
    }
    const HOLD=450,LIST=E.list,ins=document.createElement('span');
    ins.className='ins';
    function listRows(){return [...LIST.querySelectorAll('div[data-i],div[data-gr]')];}
    const rowShape=r=>r&&r.dataset.i!=null?S.objects[+r.dataset.i]:null;
    LIST.addEventListener('pointerdown',e=>{
      skipClick=false;
      if(e.pointerType==='mouse'&&e.button!==0)return;
      if(ldrag)listCancel();
      if(e.target.closest('[data-fold],[data-lkb],[data-ehb]'))return;
      const b=e.target.closest('div[data-i],div[data-gr]');if(!b)return;
      let s=null,gid=null;
      if(b.dataset.gr!=null){gid=b.dataset.gr;if(!members(gid).length)return;}
      else{s=S.objects[+b.dataset.i];if(!s)return;}
      ldrag={id:e.pointerId,s:s,gid:gid,row:b,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,live:false,gap:-1,v:0,raf:0,
        t:setTimeout(()=>listLift(),HOLD)};
    });
    function listLift(){
      const d=ldrag;if(!d)return;
      d.t=0;d.live=true;skipClick=true;
      if(d.gid!=null){d.ug=[d.gid];d.us=[];}
      else if(isSel(d.s)&&ms.length>1&&selGrp==null){const u=selUnits(S.objects.filter(isSel));d.ug=u.fg;d.us=u.loose;}
      else{d.ug=[];d.us=[d.s];}
      d.set=S.objects.filter(q=>d.us.indexOf(q)>=0||d.ug.some(id=>inG(q,id)));
      d.dep=+(d.row.dataset.dep||0);
      try{LIST.setPointerCapture(d.id);}catch(_){}
      LIST.classList.add('dragging');
      listRows().forEach(r=>{
        if(r.dataset.gr!=null){
          const id=r.dataset.gr;
          if(d.ug.some(x=>chainG(id).indexOf(x)>=0))r.classList.add(id===d.gid?'held':'lift');
          return;
        }
        const q=rowShape(r);
        if(d.set.indexOf(q)>=0)r.classList.add(q===d.s?'held':'lift');
      });
      d.row.classList.add('lift');
      if(!ins.isConnected)LIST.appendChild(ins);
      ins.style.display='block';
      try{if(navigator.vibrate)navigator.vibrate(10);}catch(_){}
      listTrack();
    }
    function listTrack(){
      const d=ldrag;if(!d||!d.live)return;
      if(!ins.isConnected){LIST.appendChild(ins);ins.style.display='block';}
      const rows=listRows();
      let g=rows.length;
      for(let k=0;k<rows.length;k++){const r=rows[k].getBoundingClientRect();if(d.y<r.top+r.height/2){g=k;break;}}
      d.gap=g;
      const t=dropInfo(d,rows,g);
      const top=g<rows.length?rows[g].offsetTop:(rows.length?rows[rows.length-1].offsetTop+rows[rows.length-1].offsetHeight:0);
      ins.style.top=top+'px';
      ins.style.visibility=t.bad?'hidden':'';
      const cd=t.dg==null?0:depthG(t.dg)+1;
      ins.style.left=cd>0?(4+LIND*cd)+'px':'';
    }
    function dropInfo(d,rows,g){
      const above=rows[g-1],below=rows[g];
      const ctxOf=r=>{
        if(r.dataset.gr!=null)return gpar(r.dataset.gr);
        const q=rowShape(r);return q&&q.g!=null?q.g:null;
      };
      const cb=below?ctxOf(below):null;
      let ca=cb;
      if(above){
        if(above.dataset.gr!=null){const H=above.dataset.gr;ca=fold().has(H)?gpar(H):H;}
        else ca=ctxOf(above);
      }
      const cands=[];let c=ca,n=0;
      while(n++<70){cands.push(c);if(c===cb||c==null)break;c=gpar(c);}
      const ok=cands.filter(x=>x==null||!d.ug.some(id=>chainG(x).indexOf(id)>=0));
      let tgt=null;
      if(below){
        if(below.dataset.gr!=null){const m=members(below.dataset.gr);tgt=m[m.length-1]||null;}
        else tgt=rowShape(below);
      }
      if(!ok.length)return{g:g,dg:null,tgt:tgt,bad:true};
      const want=d.dep+Math.round((d.x-d.sx)/LIND);
      let best=ok[0],bd=Infinity;
      ok.forEach(x=>{const cd=x==null?0:depthG(x)+1,v=Math.abs(cd-want);if(v<bd){bd=v;best=x;}});
      return{g:g,dg:best,tgt:tgt,bad:false};
    }
    function listAuto(){
      const d=ldrag;if(!d||!d.live){if(d)d.raf=0;return;}
      const r=LIST.getBoundingClientRect(),m=28;
      let v=0;
      if(d.y<r.top+m)v=-Math.ceil((r.top+m-d.y)/3);
      else if(d.y>r.bottom-m)v=Math.ceil((d.y-(r.bottom-m))/3);
      if(!v){d.raf=0;return;}
      LIST.scrollTop+=Math.max(-16,Math.min(16,v));
      listTrack();
      d.raf=requestAnimationFrame(listAuto);
    }
    LIST.addEventListener('pointermove',e=>{
      const d=ldrag;if(!d||e.pointerId!==d.id)return;
      d.y=e.clientY;d.x=e.clientX;
      if(!d.live){
        if(Math.abs(e.clientX-d.sx)+Math.abs(e.clientY-d.sy)>(e.pointerType==='mouse'?4:8)){clearTimeout(d.t);ldrag=null;}
        return;
      }
      e.preventDefault();
      listTrack();
      if(!d.raf)d.raf=requestAnimationFrame(listAuto);
    });
    LIST.addEventListener('touchmove',e=>{if(ldrag&&ldrag.live&&e.cancelable)e.preventDefault();},{passive:false});
    function dragAuto(d,sc,tr){
      if(!d.live||d.end||!sc){d.raf=0;return;}
      const r=sc.getBoundingClientRect(),m=28;let v=0;
      if(d.y<r.top+m)v=-Math.ceil((r.top+m-d.y)/3);else if(d.y>r.bottom-m)v=Math.ceil((d.y-(r.bottom-m))/3);
      if(!v){d.raf=0;return;}
      const t0=sc.scrollTop;sc.scrollTop+=Math.max(-16,Math.min(16,v));if(sc.scrollTop===t0){d.raf=0;return;}
      tr();d.raf=requestAnimationFrame(()=>dragAuto(d,sc,tr));
    }
    let sgd=null;
    LIST.addEventListener('pointerdown',e=>{
      if(!selSt||e.button>0)return;const r=e.target.closest('[data-sr]');if(!r)return;
      const d=sgd={id:e.pointerId,r:r,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,live:false,tg:null,g:null,raf:0};
      d.t=setTimeout(()=>{if(sgd!==d)return;d.live=true;skipClick=true;r.classList.add('lift','held');LIST.classList.add('dragging');
        try{LIST.setPointerCapture(d.id);}catch(_){}try{if(navigator.vibrate)navigator.vibrate(10);}catch(_){}sgTrack();},e.pointerType==='mouse'?250:HOLD);
    });
    function sgTrack(){
      const d=sgd;if(!d||!d.live)return;
      const el=(root.elementFromPoint?root.elementFromPoint(d.x,d.y):null),inL=!!el&&LIST.contains(el);
      const t=inL?el.closest('[data-sg],[data-sr]'):null,g=!inL?null:t?(t.dataset.sg!=null?t.dataset.sg:t.dataset.sgm):'';
      const h=g?LIST.querySelector('[data-sg="'+(window.CSS&&CSS.escape?fnEsc(g):g)+'"]'):null;
      if(h!==d.tg){if(d.tg)d.tg.classList.remove('sot');d.tg=h;if(h)h.classList.add('sot');}
      d.g=g;
      if(g===''&&d.r.dataset.sgm){
        const f=[...LIST.querySelectorAll('[data-sr]')].find(r=>!r.dataset.sgm),L=LIST.lastElementChild;
        if(!ins.isConnected)LIST.appendChild(ins);ins.style.display='block';ins.style.visibility='';ins.style.left='';
        ins.style.top=(f?f.offsetTop:L?L.offsetTop+L.offsetHeight:0)+'px';
      }else if(ins.isConnected)ins.style.display='none';
    }
    LIST.addEventListener('pointermove',e=>{
      const d=sgd;if(!d||e.pointerId!==d.id)return;
      d.x=e.clientX;d.y=e.clientY;
      if(!d.live){if(Math.abs(e.clientX-d.sx)+Math.abs(e.clientY-d.sy)>(e.pointerType==='mouse'?4:8)){clearTimeout(d.t);sgd=null;}return;}
      sgTrack();if(!d.raf)d.raf=requestAnimationFrame(()=>dragAuto(d,LIST,sgTrack));
    });
    const sgEnd=e=>{
      const d=sgd;if(!d||(e&&e.pointerId!==d.id))return;
      sgd=null;d.end=true;clearTimeout(d.t);if(d.raf)cancelAnimationFrame(d.raf);if(!d.live)return;
      d.r.classList.remove('lift','held');LIST.classList.remove('dragging');if(d.tg)d.tg.classList.remove('sot');if(ins.isConnected)ins.remove();
      const st=stById(+d.r.dataset.sr);skipClick=true;
      if(!st||d.g==null||d.g===d.r.dataset.sgm)return;
      settle();if(d.g)st.g=d.g;else delete st.g;render();store(true);
    };
    LIST.addEventListener('pointerup',sgEnd);LIST.addEventListener('pointercancel',sgEnd);
    LIST.addEventListener('touchmove',e=>{if(sgd&&sgd.live&&e.cancelable)e.preventDefault();},{passive:false});
    LIST.addEventListener('contextmenu',e=>{if(sgd)e.preventDefault();});
    LIST.addEventListener('contextmenu',e=>{if(ldrag)e.preventDefault();});
    function listEnd(e){
      const d=ldrag;if(!d||(e&&e.pointerId!==d.id))return;
      if(!d.live){clearTimeout(d.t);ldrag=null;return;}
      const gap=d.gap,info=gap<0?null:dropInfo(d,listRows(),gap);
      listCancel();
      if(e&&e.type==='pointercancel')return;
      listDrop(d,info);
    }
    function listCancel(){
      const d=ldrag;ldrag=null;if(!d)return;
      clearTimeout(d.t);if(d.raf)cancelAnimationFrame(d.raf);
      try{LIST.releasePointerCapture(d.id);}catch(_){}
      LIST.classList.remove('dragging');
      ins.style.display='none';ins.style.left='';ins.style.visibility='';
      LIST.querySelectorAll('.held,.lift').forEach(r=>r.classList.remove('held','lift'));
    }
    function listDrop(d,info){
      if(!info||info.bad)return;
      const set=d.set,inSet=q=>set.indexOf(q)>=0,C=info.dg;
      const D=S.objects.slice().reverse();
      let tgt=info.tgt;
      if(tgt&&inSet(tgt)){let k=D.indexOf(tgt);tgt=null;for(;k<D.length;k++)if(!inSet(D[k])){tgt=D[k];break;}}
      const mov=D.filter(inSet),rest=D.filter(q=>!inSet(q));
      rest.splice(tgt?rest.indexOf(tgt):rest.length,0,...mov);
      const nu=rest.reverse();
      const same=nu.every((q,i)=>q===S.objects[i])&&d.us.every(q=>(q.g==null?null:q.g)===C)&&d.ug.every(id=>gpar(id)===C);
      if(same)return;
      settle();
      S.objects=nu;
      d.us.forEach(q=>{if(C==null)delete q.g;else q.g=C;});
      d.ug.forEach(id=>{const G=grpOf(id);if(!G)return;if(C==null)delete G.p;else G.p=C;});
      render();store(true);
    }
    LIST.addEventListener('pointerup',listEnd);
    LIST.addEventListener('pointercancel',listEnd);

    function setTool(t){
      tool=t;draft=null;unsnap();
      root.querySelectorAll('#tools button[data-t]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===t));
      render();
    }
    $('#tools').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)setTool(b.dataset.t);});
    root.querySelectorAll('[data-msel]').forEach(b=>b.addEventListener('click',()=>{
      msel=!msel;root.querySelectorAll('[data-msel]').forEach(n=>n.setAttribute('aria-pressed',String(msel)));
    }));
    $('#uc').addEventListener('click',e=>{const b=e.target.closest('[data-u]');if(b)step(b.dataset.u==='undo'?-1:1);});
    $('#xf').addEventListener('click',e=>{const b=e.target.closest('[data-xf]');if(b&&!b.disabled)xform(b.dataset.xf);});
    function xform(k){
      if(flow)return;
      settle();
      const all=S.objects.filter(isSel);if(!all.length)return;
      const mv=movers(all);
      if(!mv.length){stamp(all.length===1?'item locked':'items locked');return;}
      const b=bboxOf(mv),cx=Math.round((b.x0+b.x1)/2),cy=Math.round((b.y0+b.y1)/2);
      const T=(x,y)=>{const dx=x-cx,dy=y-cy;
        return k==='r'?{x:cx-dy,y:cy+dx}:k==='l'?{x:cx+dy,y:cy-dx}:k==='h'?{x:cx-dx,y:y}:{x:x,y:cy-dy};};
      const A=a=>k==='r'?a+90:k==='l'?a-90:k==='h'?180-a:-a;
      const deg=a=>f(((a%360)+360)%360);
      const turn=k==='l'||k==='r';
      mv.forEach(s=>{
        const R0=phAll(s).map(I=>I.p&&I.follow?imgRect(phView(s,I)):null);
        if(isEl(s)){
          const p=T(s.x||0,s.y||0);s.x=f(p.x);s.y=f(p.y);
          const r=((Math.round((+s.rot||0)/90)*90)%360+360)%360;
          const nr=k==='r'?r+90:k==='l'?r+270:k==='h'?360-r:540-r;
          setOri(s,nr,turn?!!s.fl:!s.fl);
        }
        else if(s.t==='poly'||s.t==='line')s.p=s.p.map(q=>{const p=T(q.x,q.y);return Object.assign({},q,{x:f(p.x),y:f(p.y)});});
        else if(s.t==='rect'||s.t==='callout'||s.t==='card'){
          const g0=s.t==='callout'?coInfo(s):null;
          const w=Math.abs(s.w),h=Math.abs(s.h),c=T(Math.min(s.x,s.x+s.w)+w/2,Math.min(s.y,s.y+s.h)+h/2);
          const W=turn?h:w,H=turn?w:h;
          s.x=f(c.x-W/2);s.y=f(c.y-H/2);s.w=f(W);s.h=f(H);
          if(turn&&s.t==='callout'&&s.body==='line'){if(s.lo==='v')delete s.lo;else s.lo='v';}
          if(g0){
            const tp=T(g0.tip.x,g0.tip.y),bc=T(g0.c.x,g0.c.y);
            s.px=f(tp.x);s.py=f(tp.y);
            if(!turn&&s.bend)s.bend=-s.bend;
            const g=coInfo(s),sp=g.hi-g.lo-g.tw;
            if(!g.inside&&sp>0)s.tb=r4(Math.max(0,Math.min(1,((g.hz?bc.x:bc.y)-g.lo-g.tw/2)/sp)));
          }
        }else{
          const c=T(s.cx,s.cy);s.cx=f(c.x);s.cy=f(c.y);
          if(s.t==='reg')s.rot=deg(A(s.rot||0));
          if(s.t==='ring'){const a0=A(s.a0),a1=A(s.a1),sp=Math.abs(a1-a0),lo=deg(Math.min(a0,a1));s.a0=lo;s.a1=f(lo+sp);}
        }
        phAll(s).forEach((I,i)=>{const Q=R0[i];if(!Q)return;const c=T(Q.x+Q.w/2,Q.y+Q.h/2);I.box=boxFor(s,{x:c.x-Q.w/2,y:c.y-Q.h/2,w:Q.w,h:Q.h});});
      });
      if(mv.length<all.length)stamp((all.length-mv.length)+' locked '+(all.length-mv.length===1?'item':'items')+' not changed');
      render();store(true);
    }
    function setOri(s,r,fl){
      r=((Math.round(r/90)*90)%360+360)%360;
      if(r)s.rot=r;else delete s.rot;
      if(fl)s.fl=true;else delete s.fl;
    }
    function xfRefresh(){
      const on=!flow&&ms.length>0;
      root.querySelectorAll('#xf [data-xf]').forEach(n=>{if(n.disabled===on)n.disabled=!on;});
    }
    $('#bgfit').addEventListener('change',e=>{settle();S.bgFit=e.target.value;render();store(true);});
    E.ratio.addEventListener('change',e=>{
      const v=e.target.value;
      if(!v){fields();return;}
      let r;
      if(v==='bg'){
        const d=dims.get(full(bgBase()));
        if(!d||!d.h){stamp('background size unknown',true);fields();return;}
        r=d.w/d.h;
      }else r=parseFloat(v);
      settle();S.h=Math.max(50,Math.round(S.w/r));
      fields();fit();store(true);
    });
    const dimIn=k=>e=>{const v=Math.round(+e.target.value);if(!(v>=50))return;S[k]=v;E.ratio.innerHTML=ratioOptions();render();store();};
    $('#cw').addEventListener('input',dimIn('w'));
    $('#ch').addEventListener('input',dimIn('h'));
    E.sg.addEventListener('change',render);E.sv.addEventListener('change',render);
    $('#gs').addEventListener('input',e=>{const v=Math.round(+e.target.value);if(!(v>=2))return;S.grid=Math.min(1000,v);render();store();});
    $('#gs').addEventListener('change',e=>{e.target.value=S.grid;});
    function blPanel(){
      const n=$('#blpanel'),L=BGS(),SL=styles().filter(Boolean);
      const key=JSON.stringify([L.map(b=>[b.id,styIds(b)]),SL.map(x=>x.id+':'+x.n),RULS().map(r=>[r.id,rName(r),rOn(r)])]);
      if(n._k!==key){
        n._k=key;
        let h='';
        L.slice().reverse().forEach(b=>{
          const i=L.indexOf(b),on=stysOf(b).reverse(),off=SL.filter(x=>on.indexOf(x)<0),SA=x=>soAttr('l:'+b.id,on,x);
          const R=RULS().filter(r=>rOn(r).indexOf(b.id)>=0);
          h+='<div class="bll" data-bl="'+esc(b.id)+'"><div class="blh">'+
            '<input class="num" type="text" data-blf="n" autocomplete="off" aria-label="Layer name" value="'+esc(b.n||'')+'">'+
            '<button type="button" class="evb" data-bla="up"'+(i<L.length-1?'':' disabled')+' title="Forward" aria-label="Forward">↑</button>'+
            '<button type="button" class="evb" data-bla="down"'+(i>0?'':' disabled')+' title="Backward" aria-label="Backward">↓</button>'+
            '<button type="button" class="evb" data-bla="del" title="Delete layer" aria-label="Delete layer">✕</button></div>'+
            '<div class="prow"><input class="num" type="text" data-blf="p" placeholder="immagini/night.jpg" aria-label="Layer file" value="'+esc(b.p||'')+'">'+
            '<button class="btn" type="button" data-bla="browse">Browse…</button></div>'+
            '<p class="hint" data-blst style="margin-top:0" hidden></p>'+
            tbx('Base look',on.map(x=>'<div class="slr"'+SA(x).a+'><span class="nm">'+esc(x.n||'(unnamed)')+SA(x).w+'</span><button type="button" class="evb" data-blsdel="'+x.id+'" title="Remove style" aria-label="Remove style">✕</button></div>').join('')+
            (off.length?'<select class="num lkadd stadd" data-bladd aria-label="Add look">'+lookOpts(off,false)+'</select>':''))+
            tbx('Rules','<div class="blr">'+
              R.map(r=>'<button type="button" class="btn'+(rOk(r)?'':' miss')+'" data-blru="'+esc(r.id)+'" title="Edit the rule">'+esc(rName(r))+'</button>').join('')+
              '</div><button type="button" class="btn add" data-bla="rule">+ rule</button>')+'</div>';
        });
        h+='<div class="row"><button class="btn add" type="button" data-bla="new">+ layer</button></div>';
        n.innerHTML=h;
      }
      n.querySelectorAll('.bll[data-bl]').forEach(d=>{
        const b=bgOf(d.dataset.bl);if(!b)return;
        d.querySelectorAll('[data-blf]').forEach(i=>{if(i!==root.activeElement){const v=b[i.dataset.blf]||'';if(i.value!==v)i.value=v;}});
        const st=d.querySelector('[data-blst]'),t=phWarn(b.p);if(st){if(st.textContent!==t)st.textContent=t;if(st.hidden!==!t)st.hidden=!t;}
      });
    }
    $('#blpanel').addEventListener('input',e=>{
      const i=e.target.closest('[data-blf]'),d=e.target.closest('[data-bl]'),b=d&&bgOf(d.dataset.bl);if(!i||!b)return;
      const v=i.value.replace(/[\r\n]+/g,' ');
      if(i.dataset.blf==='n'){if(v.trim())b.n=v;}else b.p=v.trim();
      render();store();
    });
    $('#blpanel').addEventListener('change',e=>{
      const a=e.target.closest('[data-bladd]'),d=e.target.closest('[data-bl]'),b=d&&bgOf(d.dataset.bl);if(!a||!b||!a.value)return;
      settle();setSty(b,+a.value,true);render();store(true);
    });
    $('#blpanel').addEventListener('click',e=>{
      const ru=e.target.closest('[data-blru]');if(ru){ruOpen(ru.dataset.blru);return;}
      const x=e.target.closest('[data-bla],[data-blsdel]');if(!x||x.disabled)return;
      const d=x.closest('[data-bl]'),b=d&&bgOf(d.dataset.bl),w=x.dataset.bla;
      if(w==='new'){
        settle();if(!Array.isArray(S.bgs))S.bgs=[];
        const b={id:newId('b',S.bgs),n:'Layer '+(S.bgs.length+1),p:''};S.bgs.push(b);render();store(true);
        galOpen({blId:b.id});return;
      }
      if(!b)return;
      if(x.dataset.blsdel){settle();setSty(b,+x.dataset.blsdel,false);render();store(true);return;}
      if(w==='browse'){galOpen({blId:b.id});return;}
      if(w==='rule'){ruleNew([b.id]);return;}
      if(w==='up'||w==='down'){
        const L=S.bgs,i=L.indexOf(b),j=i+(w==='up'?1:-1);if(j<0||j>=L.length)return;
        settle();L.splice(i,1);L.splice(j,0,b);render();store(true);return;
      }
      if(w==='del'){
        const R=RULS().filter(r=>rOn(r).indexOf(b.id)>=0);
        if(R.length&&!confirm('Delete layer “'+(b.n||b.id)+'”? '+R.length+(R.length===1?' rule loses':' rules lose')+' it as a target.'))return;
        settle();S.bgs=S.bgs.filter(q=>q!==b);if(!S.bgs.length)delete S.bgs;render();store(true);
      }
    });
    $('#save').onclick=()=>{pmShow(false);flush();download((proj||'zone')+'.json',JSON.stringify(S,null,2),'application/json');};
    $('#load').onclick=()=>{pmShow(false);$('#loadf').click();};
    $('#loadf').addEventListener('change',e=>{const fl=e.target.files[0];if(!fl)return;const r=new FileReader();
      r.onload=()=>{let q=null;try{q=JSON.parse(r.result);}catch(_){}
        const fm=fmtOf(q);
        if(fm===1){alert(V1_MSG+'.\nThis file was saved by Zone Editor 1.x: start a new project and draw it again.');return;}
        if(fm>FORMAT){alert('This file was saved by a newer version of Ada Studio: update Ada Studio to open it.');return;}
        if(fm!==FORMAT||!Array.isArray(q.objects)){alert('Not a valid project file.');return;}
        if(proj&&!confirm('Replace the content of “'+proj+'” with this file?'))return;
        const v=S.ver,pb=S.pub;
        S=Object.assign(fresh(),q);S.ver=v;if(pb!=null)S.pub=pb;else delete S.pub;
        pick([]);probes.clear();render();fields();fit();flush();snap();};r.readAsText(fl);e.target.value='';});
    E.menu.addEventListener('click',()=>{
      const ev=new Event('hass-toggle-menu',{bubbles:true,composed:true});ev.detail={};self.dispatchEvent(ev);
    });
    function chrome(){
      const h=self._hass;
      const md=(self._narrow||(h&&h.dockedSidebar==='always_hidden'))?'':'none';if(E.menu.style.display!==md)E.menu.style.display=md;
      const t=proj?('Folder: config/'+self._folder+'/'+proj)
                  :('Folder: config/'+self._folder+' (no project open)');
      if(E.fold.textContent!==t)E.fold.textContent=t;
      pverRender();
    }

    function coExp(){
      const out=[],used=new Set();
      S.objects.forEach(s=>{
        if(isEl(s)||!s.id)return;
        if(hasImg(s)&&!fillOf(s).c)return;
        const cg=coGrads(s);if(!cg)return;
        let sf=slug(s.id),n=2;while(used.has(sf))sf=slug(s.id)+'-'+n++;used.add(sf);
        out.push({s:s,g:cg.g,p:cg.p,c:cg.c||'zone',sf:sf});
      });
      return out;
    }
    const cssId=v=>'#'+String(v).replace(/[^A-Za-z0-9_-]/g,c=>'\\'+c).replace(/^(-?)(\d)/,'$1\\3$2 ');
    function coRules(o){return cssId(o.s.id)+'{ fill: url(#pat-'+o.c+'-n-'+o.sf+'); }\n';}
    function evJSk(k){
      const V='v('+JSON.stringify(k.e)+', '+JSON.stringify(k.a||'')+')',a=k.v,b=k.v2;
      let c;
      if(k.op==='='||k.op==='!='){
        const t=evNum(a)?'num(x) ? Number(x) === '+Number(a)+' : String(x) === '+JSON.stringify(String(a)):'String(x) === '+JSON.stringify(String(a==null?'':a));
        c=(k.op==='!='?'!':'')+'(function (x) { return '+t+'; })('+V+')';
      }else if(!evNum(a)||(k.op==='btw'&&!evNum(b)))c='false';
      else if(k.op!=='btw'&&['>','>=','<','<='].indexOf(k.op)<0)c='false';
      else{
        const A=Number(a),t=k.op==='btw'?'Number(x) >= '+Math.min(A,Number(b))+' && Number(x) <= '+Math.max(A,Number(b)):'Number(x) '+k.op+' '+A;
        c='(function (x) { return num(x) && '+t+'; })('+V+')';
      }
      return 'ok('+JSON.stringify(k.e)+') && '+c;
    }
    const condOk=()=>mem('co',0,()=>RULS().filter(r=>rOk(r)&&rKind(r)==='cond'));
    const tapEl=s=>isEl(s)&&gstAny(s);
    const thruOn=s=>!!s&&s.thru===true&&kindOf(s)==='z'&&!gstAny(s);
    function fixedCls(s){
      const k=kindOf(s);
      if(k==='z')return zcls(s);
      if(k==='c')return cdCls(s);
      if(k==='l')return ecls(s,s.id)+(tapEl(s)?' tocca':'');
      return tapEl(s)?'tocca':'';
    }
    function symList(s){
      if(s.t!=='icon')return [];
      return condOk().filter(r=>rSymI(r)&&rObjs(r).indexOf(s)>=0).map(r=>({n:rNum(r),icon:rSymI(r)}));
    }
    function ruleEls(){
      const R=condOk(),used=new Set(),out=[];
      R.forEach(r=>rOn(r).forEach(id=>used.add(id)));
      if(!used.size)return out;
      const L=id=>R.filter(r=>rOn(r).indexOf(id)>=0);
      (S.groups||[]).filter(G=>used.has(G.id)).sort((a,b)=>depthG(a.id)-depthG(b.id)).forEach(G=>{
        const ks=[];
        members(G.id).forEach(q=>{if(isEl(q)&&!expEl(q)||isCard(q))return;const k=kindOf(q);if(ks.indexOf(k)<0)ks.push(k);});
        if(ks.length)out.push({k:'g',id:G.id,st:'gruppo',kinds:['z','l','i'].filter(k=>ks.indexOf(k)>=0),ph:members(G.id).some(hasImg),L:L(G.id)});
      });
      S.objects.forEach(s=>{
        if(isEl(s)&&!expEl(s))return;
        if(isCard(s)){const Lc=cdCfg(s)?cdRules(s):[];if(Lc.length)out.push({k:'c',id:s.id,st:fixedCls(s),L:Lc});return;}
        if(used.has(s.id))out.push({k:kindOf(s),id:s.id,st:fixedCls(s),L:L(s.id)});
        if(used.has(s.id))clipEls(s).forEach(e=>out.push({k:'c',id:e,st:zcls(s),L:L(s.id)}));
        if(!hasImg(s))return;
        const Lp=L(s.id).filter(phoRule),Lx=L(s.id).filter(xRule),La=L(s.id).filter(r=>idsStys(rSty(r)).some(anWhole)),mu=phMulti(s),d0=phDef(s);
        const N=phAll(s).filter(I=>I.p).map(I=>phName(s,I));
        const Pr=mu?R.filter(r=>{const x=fxOf(r,'pho');return x&&N.indexOf(x.n)>=0&&rHas(r,s);}):[];
        phAll(s).forEach((I,i)=>{
          const LL=R.filter(r=>Lp.indexOf(r)>=0||I.follow&&Lx.indexOf(r)>=0||Pr.indexOf(r)>=0||La.indexOf(r)>=0);
          if(!I.p||!LL.length)return;
          out.push({k:'p',id:phElId(s,i),st:phoCls(s,i),L:LL,pho:mu?{me:phName(s,I),def:i===d0,R:Pr}:null});
        });
      });
      BGS().forEach(b=>{
        if(!b.p||!used.has(b.id))return;
        const Lb=L(b.id).filter(phoRule);
        if(Lb.length)out.push({k:'b',id:b.id,st:bglCls(b),L:Lb});
      });
      return out;
    }
    const phoRule=r=>idsStys(rSty(r)).some(stPho);
    const xRule=r=>idsStys(rSty(r)).some(stX);
    const grpBox=id=>bboxOf(members(id).filter(q=>!isCard(q)&&(!isEl(q)||expEl(q))));
    const anCond=id=>condOk().filter(r=>rOn(r).indexOf(id)>=0&&idsStys(rSty(r)).some(anWhole));
    const anTap=id=>tapLys().filter(q=>{const x=q.x;return Array.isArray(x.to)&&x.to.indexOf(id)>=0&&idsStys(x.sty).some(anWhole);});
    function anZoneSrc(s){
      if(isEl(s)||!phAll(s).some(I=>I.p))return null;
      const B=stysOf(s).filter(anWhole),C=anCond(s.id),T=anTap(s.id);
      return B.length||C.length||T.length?{B:B,C:C,T:T}:null;
    }
    const xTapOn=id=>RULS().filter(r=>{const x=actSty(r);return !!x&&Array.isArray(x.to)&&x.to.indexOf(id)>=0&&idsStys(x.sty).some(stX)&&styUsed(r);});
    const xRuleOn=id=>condOk().some(r=>rOn(r).indexOf(id)>=0&&xRule(r))||xTapOn(id).length>0;
    const tfZone=s=>!isEl(s)&&(stysOf(s).some(stX)||xRuleOn(s.id));
    const bindMvOn=id=>bindRules().some(b=>bindTf(b.x)&&b.T.indexOf(id)>=0);
    const anZoneMv=s=>{const A=anZoneSrc(s);return !!A&&A.B.concat(...A.C.map(r=>idsStys(rSty(r))),...A.T.map(q=>idsStys(q.x.sty))).some(anMv);};
    const zMv=s=>mem('zmv',s.id,()=>tfZone(s)||anZoneMv(s)||bindMvOn(s.id)||amMvOn(s.id));
    const tfClip=s=>!isEl(s)&&phAll(s).some(I=>I.p&&!I.follow)&&zMv(s);
    const gMv=id=>mem('gmv',id,()=>xRuleOn(id)||anCond(id).some(r=>idsStys(rSty(r)).some(anMv))||
      anTap(id).some(q=>idsStys(q.x.sty).some(anMv))||bindMvOn(id)||amMvOn(id));
    const agOf=s=>mem('ag',s.id,()=>!isEl(s)&&phAll(s).some(I=>I.p&&!I.follow)?chainOf(s).filter(gMv):[]);
    const agNeed=id=>mem('agn',id,()=>members(id).some(q=>agOf(q).indexOf(id)>=0));
    const agSel=(sel,w,id)=>sel.split(', ').map(q=>q+' .'+w+'-'+slug(id)).join(', ');
    function agCSS(id,sel,D){
      if(!agNeed(id))return '';
      const G=D.filter(d=>/^(translate|rotate|scale|transform-box|transform-origin|transition|animation-duration|animation-play-state):/.test(d));
      const K=G.filter(d=>/^(transform-box|transform-origin|animation-)/.test(d)),blk=(s,L)=>L.length?s+'{ '+L.join('; ')+'; }\n':'';
      return blk(agSel(sel,'fg',id),G)+blk(agSel(sel,'fa',id),K)+blk(agSel(sel,'fb',id),G.map(d=>K.indexOf(d)>=0?d:invDecl(d)));
    }
    function agAn(st,sel,cls,id,b){
      if(!agNeed(id))return '';
      const A=anOf(st,stState(st,'n'),'z',{w:b.x1-b.x0,h:b.y1-b.y0},'w');if(!A)return '';
      const kf='anim-'+cls+'-'+slug(id),mv=anMv(st),cu=st.anim==='custom',iv=kf+'-i '+A.sh,o=moOrg(st,b);
      return '@media (prefers-reduced-motion: no-preference){\n  '+agSel(sel,'fg',id)+'{ animation: '+kf+' '+A.sh+';'+o+' }\n  '+
        agSel(sel,'fa',id)+'{ animation: '+(mv&&!cu?iv:'none')+';'+o+' }\n  '+agSel(sel,'fb',id)+'{ animation: '+(mv&&cu?iv:'none')+';'+o+' }\n}\n'+
        (mv?'@keyframes '+kf+'-i{ '+kfInv(A.kf)+' }\n':'');
    }
    const tfFol=s=>tfZone(s)&&phAll(s).some(I=>I.p&&I.follow);
    const clipElId=s=>s.id+'.ritaglio';
    const clipEls=s=>tfClip(s)?[clipElId(s)].concat(fdMv(s).map(st=>fdElId(s,st))):[];
    const lvSel=q=>/\\\.(ritaglio|sfuma-)/.test(q)?q+q:'#livelli '+q;
    const tfEl=s=>isEl(s)&&expEl(s)&&(stysOf(s).some(stTf)||condOk().some(r=>rOn(r).indexOf(s.id)>=0&&idsStys(rSty(r)).some(stTf))||
      tapLys().some(q=>(q.x.to||[]).indexOf(s.id)>=0&&idsStys(q.x.sty).some(stTf))||amMvOn(s.id)||
      bindRules().some(b=>bindTf(b.x)&&b.T.indexOf(s.id)>=0));
    const trX=st=>{const d=Math.max(0,+st.dur||0);return d?TR_X.map(k=>k+' '+d+'ms '+(st.ease||'ease')).join(', '):'none';};
    const bxC=b=>({x:(b.x0+b.x1)/2,y:(b.y0+b.y1)/2});
    function tfGroups(){
      const out=[];
      (S.groups||[]).forEach(G=>{
        const R=condOk().filter(r=>rOn(r).indexOf(G.id)>=0&&xRule(r)),RT=xTapOn(G.id);if(!R.length&&!RT.length)return;
        const m=members(G.id).filter(q=>!isCard(q)&&(!isEl(q)||expEl(q)));if(!m.length)return;
        let t='';
        R.map(rSty).concat(RT.map(r=>actSty(r).sty)).some(a=>idsStys(a).some(st=>{if(stX(st)&&stHas(st,'t')){t=trX(st);return true;}return false;}));
        out.push({G:G,c:bxC(bboxOf(m)),t:t,R:R});
      });
      return out;
    }
    function tfObjCSS(){
      let c='';
      const o=p=>f(p.x)+'px '+f(p.y)+'px';
      S.objects.forEach(s=>{
        if(isEl(s)){if(tfEl(s)){const v=tfVars(s);if(v)c+=cssId(s.id)+'{ '+v+'; }\n';}return;}
        const az=!!anZoneSrc(s),tf=tfFol(s);
        if(!tf&&!az)return;
        const ids=[s.id].concat(phAll(s).map((I,i)=>I.p&&(az||I.follow)?phElId(s,i):null).filter(Boolean),az?clipEls(s):[]);
        c+=ids.map(x=>lvSel(cssId(x))).join(', ')+'{ transform-box: view-box; transform-origin: '+o(bxC(bboxOf([s])))+'; }\n';
      });
      const TG=tfGroups();
      TG.forEach(g=>{
        c+=cssId(g.G.id)+'{ transform-box: view-box; transform-origin: '+o(g.c)+';'+(g.t?' transition: '+g.t+';':'')+' }\n';
        c+=agCSS(g.G.id,cssId(g.G.id),['transform-box: view-box','transform-origin: '+o(g.c)].concat(g.t?['transition: '+g.t]:[]));
      });
      (S.groups||[]).forEach(G=>{
        if(TG.some(g=>g.G===G)||!anCond(G.id).length&&!anTap(G.id).length)return;
        if(!members(G.id).some(q=>!isEl(q)||expEl(q)))return;
        const ce=o(bxC(grpBox(G.id)));
        c+=cssId(G.id)+'{ transform-box: view-box; transform-origin: '+ce+'; }\n'+agCSS(G.id,cssId(G.id),['transform-box: view-box','transform-origin: '+ce]);
      });
      return c?'\n/* Transform: centres of zones whose photo follows the shape and of groups moved by a rule,\n'+
        '   reference frames of rotated labels and scaled icons. */\n'+c:'';
    }
    function ruleYAML(x){
      const ents=[],K=[];
      x.L.forEach(r=>rCs(r).forEach(k=>{if(!causeJS(k))return;if(K.indexOf(k)<0)K.push(k);if(ents.indexOf(k.e)<0)ents.push(k.e);}));
      const js=HELP.slice();
      K.forEach(k=>js.push('var '+k.id+' = '+causeJS(k)+';'));
      js.push('var c = '+JSON.stringify(x.st)+';');
      x.L.forEach(r=>js.push('if ('+rCs(r).filter(causeJS).map(k=>k.id).join(rOr(r)?' || ':' && ')+') c += " r-'+rNum(r)+'";'));
      if(x.pho){
        js.push('var ph = "";');
        x.pho.R.forEach(r=>js.push('if (!ph && ('+rCs(r).filter(causeJS).map(k=>k.id).join(rOr(r)?' || ':' && ')+')) ph = '+JSON.stringify(fxOf(r,'pho').n)+';'));
        js.push('if (ph ? ph !== '+JSON.stringify(x.pho.me)+' : '+(!x.pho.def)+') c += " spenta";');
      }
      js.push('return c.trim();');
      return '  # '+x.id+': '+x.L.map(r=>r.id).join(', ')+'\n'+
        '  - entities:\n'+ents.map(e=>'      - '+JSON.stringify(e)+'\n').join('')+
        '    element: '+x.id+'\n    tap_action: false\n    hover_action: false\n'+
        '    state_action:\n      service: floorplan.class_set\n      service_data: |\n        >\n'+
        js.map(l=>'        '+l).join('\n')+'\n';
    }
    function tapEls(){
      const out=[];
      S.objects.forEach(s=>{
        if(!gstOut(s))return;
        const P=tapPlan(s,'tap');if(P.length)out.push({s:s,P:P,el:isCard(s)?s.id+'-v':s.id});
      });
      return out;
    }
    function swEls(){
      return mem('sw',0,()=>{
        const M={},U=new Map();
        S.objects.forEach(s=>{
          if(!gstOut(s))return;
          SW_G.forEach(g=>{
            const P=tapPlan(s,g);if(!P.length)return;
            const el='sw-'+P.map(q=>rNum(q.r)).join('-');if(!U.has(el))U.set(el,{s:null,P:P,el:el,g:g});
            (isCard(s)?[s.id].concat(actRule(s)?[s.id+'-v']:[]):[s.id]).forEach(id=>{(M[id]=M[id]||{})[SW_D[g]]=el;});
          });
        });
        const R=RULS(),H=[...U.values()].sort((x,y)=>R.indexOf(x.P[0].r)-R.indexOf(y.P[0].r)||x.P.length-y.P.length);
        return {M:M,H:H};
      });
    }
    function tapDs(x,r,mv){
      const E2=tapStyEls(x),n=rNum(r),at=mv?'data-m':'data-t'+n,A=mv?n+'-a':'a',B=mv?n+'-b':'b';
      const v=(mv?mvRe(x):tapRe(r))&&E2.length?['>-',"  > const s = element.closest('svg'), e = s && s.getElementById('"+E2[0]+"'); return e && e.getAttribute('"+at+"') === '"+A+"' ? '"+B+"' : '"+A+"';"]:[mv?"'"+n+"'":"'on'"];
      return ['action: call-service','service: floorplan.dataset_set','service_data:','  key: '+(mv?'m':'t'+n),'  value: '+v[0]].concat(v.slice(1).map(l=>'  '+l),['  elements:'],E2.map(id=>'    - '+id));
    }
    function tapAct(x,r){
      const a=actA(x),e=x.e||'';
      if(a==='page'){
        const T=pgTrOf(x),pg=x.pg,first=PGS()[0].id;
        return {e:'',L:['action: call-service','service: floorplan.class_set','service_data:','  element: livelli','  class: |','    >',
          "    var c = element.getAttribute('class') || '', m = /(?:^|\\s)pg-(\\S+)/.exec(c), cur = m ? m[1] : '"+first+"';",
          "    return cur === '"+pg+"' ? c : "+(T.t==='none'?"'pg-"+pg+"'":"'pg-"+pg+" da-' + cur + ' tr-"+T.tok+"'")+";"]};
      }
      if(a==='sty')return {e:'',L:tapDs(x,r,false)};
      if(a==='info')return {e:e,L:['action: more-info'],info:true};
      if(a==='nav')return {e:'',L:['action: navigate','navigation_path: '+JSON.stringify(x.u)]};
      if(a==='svc'){
        const D=Object.assign(e?{entity_id:e}:{},svcData(x.d).o),K=Object.keys(D);
        return {e:e,L:['action: call-service','service: '+x.svc].concat(K.length?['service_data:'].concat(K.map(k=>'  '+k+': '+(k==='entity_id'&&typeof D[k]==='string'?D[k]:JSON.stringify(D[k])))):[])};
      }
      return {e:e,L:['action: call-service','service: '+actSvc(e),'service_data:','  entity_id: '+e]};
    }
    function tapYAML(x){
      const A=[];
      x.P.forEach(q=>{if(q.a)A.push(tapAct(q.a,q.r));if(q.mv)A.push({e:'',L:tapDs(q.mv,q.r,true)});});
      if(!A.length)return '';
      const I=A.find(q=>q.info),E=I?I.e:(A.find(q=>q.e)||{}).e||'',el=x.el;
      const h='  # '+el+': '+x.P.filter(q=>q.a||q.mv).map(q=>q.r.id).join(', ')+' ('+(SW_L[x.g]?SW_L[x.g].toLowerCase():'tap')+')\n'+
        (E?'  - entity: '+E+'\n    element: ':'  - element: ')+el+'\n';
      if(A.length===1&&I)return h+'    tap_action: more-info\n';
      return h+'    tap_action:\n'+(A.length===1?A[0].L.map(l=>'      '+l+'\n').join(''):A.map(q=>q.L.map((l,i)=>(i?'        ':'      - ')+l+'\n').join('')).join(''));
    }
    function pgTrUsed(){
      const U=new Map(),add=(T,pg)=>{if(T.t==='none')return;if(!U.has(T.tok))U.set(T.tok,{T:T,to:new Set()});U.get(T.tok).to.add(pg);};
      tapEls().concat(swEls().H).forEach(x=>x.P.forEach(q=>{if(q.a&&actA(q.a)==='page'&&pgOf(q.a.pg))add(pgTrOf(q.a),q.a.pg);}));
      PGS().forEach(p=>add(pgTr(p),p.id));
      return U;
    }
    function pgTrCSS(){
      const U=pgTrUsed();
      if(!U.size)return '';
      const kf=(n,F)=>'@keyframes '+n+'{ from{ '+Object.keys(F[0]).map(k=>k+': '+F[0][k]).join('; ')+'; } to{ '+Object.keys(F[1]).map(k=>k+': '+F[1][k]).join('; ')+'; } }\n';
      let c='/* Page transitions of Go to page: classes da-<from> and tr-<transition> on #livelli. */\n';
      PGS().forEach(p=>{const A=pgA(p);c+='#'+p.id+'{ transform-box: view-box; transform-origin: '+f(A.x+A.w/2)+'px '+f(A.y+A.h/2)+'px; }\n';});
      const done=new Set();
      U.forEach(u=>{
        const T=u.T,k=T.t+(T.d?'-'+T.d:''),ti=pgTime(T,false),to=pgTime(T,true);
        PGS().forEach(p=>{
          const A=pgA(p),n=k+'-'+p.id;
          if(!done.has(n)){done.add(n);c+=kf('pg-in-'+n,pgFrames(T,A,false))+kf('pg-out-'+n,pgFrames(T,A,true));}
          if(u.to.has(p.id))c+='#livelli.tr-'+T.tok+'.pg-'+p.id+' #'+p.id+'{ animation: pg-in-'+n+' '+ti.d+'ms ease-in-out'+(ti.w?' '+ti.w+'ms':'')+' both; }\n';
          c+='#livelli.tr-'+T.tok+'.da-'+p.id+' #'+p.id+'{ display: inline; animation: pg-out-'+n+' '+to.d+'ms ease-in-out both; }\n';
        });
      });
      return c;
    }
    function tapStyEls(x){
      const out=[],add=id=>{if(out.indexOf(id)<0)out.push(id);};
      (x.to||[]).forEach(id=>{
        const o=tgtOf(id);if(!o)return;
        if(isBgl(o)){if(o.p)add(o.id);return;}
        if(isGrp(o)){if(members(id).some(q=>!isCard(q)&&(!isEl(q)||expEl(q))))add(id);members(id).forEach(q=>{if(isCard(q)&&cdCfg(q))add(q.id);});return;}
        if(isCard(o)){if(cdCfg(o))add(o.id);return;}
        if(isEl(o)){if(expEl(o))add(o.id);return;}
        add(o.id);
        phAll(o).forEach((I,i)=>{if(I.p)add(phElId(o,i));});
        clipEls(o).forEach(add);
      });
      return out;
    }
    function anZoneCSS(){
      const ids=stIds();let c='';
      const last=L=>L.filter(anWhole).slice(-1)[0];
      S.objects.forEach(s=>{
        const A=anZoneSrc(s);if(!A)return;
        const b=bboxOf([s]),P=phAll(s).map((I,i)=>I.p?{e:phElId(s,i),fo:!!I.follow}:null).filter(Boolean),rg=clipEls(s);
        const an=P.filter(q=>!q.fo).map(q=>q.e);
        const sel=(L,suf)=>L.map(e=>lvSel(cssId(e))+suf).join(', ');
        const put=(st,suf)=>{
          const mv=anMv(st),off=mv?an:rg,op=mv&&st.anim==='custom'&&moOf(st).pp.indexOf('op')>=0&&an.length;
          c+=anPiece(st,sel([s.id].concat(P.filter(q=>q.fo||!mv).map(q=>q.e),mv?rg:[]),suf),ids.get(st.id),s.id,b);
          if(st.anim==='custom'&&moFam(st,'s'))c+=anPiece(st,sel([s.id],suf),ids.get(st.id),s.id+'-z',b,'ws');
          if(op)c+=anPiece(st,sel(an,suf),ids.get(st.id),s.id+'-o',b,'o');
          else if(off.length)c+=sel(off,suf)+'{ animation: none; }\n';
        };
        if(rg.length)c+=sel(rg,'')+'{ animation: none; }\n';
        if(A.B.length)put(last(A.B),'');
        A.C.slice().reverse().forEach(r=>put(last(idsStys(rSty(r))),'.r-'+rNum(r)));
        A.T.slice().reverse().forEach(q=>put(last(idsStys(q.x.sty)),q.key));
      });
      return c?'\n/* Zones with a photo animated as a whole: the photo moves with the zone, around its centre. */\n'+c:'';
    }
    function tapReCSS(c){
      const N=tapLys().filter(q=>q.re);if(!N.length)return c;
      const K=new Set();
      const items=v=>{const o=[];let d=0,a=0;for(let i=0;i<v.length;i++){const ch=v[i];if(ch==='(')d++;else if(ch===')')d--;else if(ch===','&&!d){o.push(v.slice(a,i).trim());a=i+1;}}o.push(v.slice(a).trim());return o;};
      N.forEach(q=>{
        const n=rNum(q.r),a=q.key,ka=q.m?'[data-m="'+n+'-a"]':'[data-t'+n+'="a"]',kb=q.m?'[data-m="'+n+'-b"]':'[data-t'+n+'="b"]';
        c=c.replace(/^( *)([^\n{}@]+)\{ animation: ([^;\n]+);([^\n]*)\}$/mg,(all,ind,sel,v,rest)=>{
          if(sel.indexOf(a)<0)return all;
          let ch=false;
          const B=items(v).map(q=>{const m=/^([\w-]+)(.*)$/.exec(q);if(!m||m[1]==='none'||/\binfinite\b/.test(m[2]))return q;ch=true;K.add(m[1]);return m[1]+'-b'+m[2];}).join(', ');
          if(!ch)return all;
          return ind+sel.split(a).join(ka)+'{ animation: '+v+';'+rest+'}\n'+ind+sel.split(a).join(kb)+'{ animation: '+B+';'+rest+'}';
        });
      });
      let k='';
      K.forEach(nm=>{const m=new RegExp('^ *@keyframes '+nm+'\\{[^\\n]*\\}$','m').exec(c);if(m)k+=m[0].trim().replace('@keyframes '+nm+'{','@keyframes '+nm+'-b{')+'\n';});
      return k?c+'\n/* Apply style with a finite animation: data-t<n> alternates a / b at each tap, so the animation restarts. */\n'+k:c;
    }
    function tapStyCSS(){
      const R=tapLys();if(!R.length)return '';
      const ids=stIds(),T={z:'.zone',l:'.etichetta',i:'.icona'},blk=(sel,d)=>d.length?sel+'{\n  '+d.join(';\n  ')+';\n}\n':'';
      let c='\n/* Tap rules with Apply style: attribute data-t<n> written by floorplan.dataset_set, kept until\n'+
            '   the page reloads. Written after the rules: a style switched on by a tap wins. */\n';
      R.slice().reverse().forEach(q=>{
        const x=q.x,key=q.key,L=idsStys(x.sty),E2=tapStyEls(x);
        x.to.forEach(id=>{
          if(E2.indexOf(id)<0)return;
          const o=tgtOf(id),I=cssId(id);
          if(isCard(o))return;
          if(isBgl(o)){L.forEach(st=>{c+=blk(I+'.sfondo-livello'+key,phoDecl(st));});return;}
          if(isGrp(o)){
            const M=members(id).filter(q=>!isEl(q)||expEl(q));
            ['z','l','i'].filter(k=>M.some(q=>kindOf(q)===k)).forEach(k=>L.forEach(st=>{
              const sl=I+key+' '+T[k];
              c+=stRules(st,Object.assign(expQ(ids.get(st.id),k),{base:sl,cur:false,h:k==='z'?sl+':hover':null,noTf:true,noAn:anWhole(st)}));
            }));
            L.forEach(st=>{if(anWhole(st))c+=anPiece(st,I+key,ids.get(st.id),id,grpBox(id))+agAn(st,I+key,ids.get(st.id),id,grpBox(id));});
            L.forEach(st=>{if(!stX(st))return;const d=tfDecl(stState(st,'n'),'g');if(stHas(st,'t'))d.push('transition: '+trX(st));c+=blk(I+key,d)+agCSS(id,I+key,d);});
            if(M.some(hasImg))L.forEach(st=>{c+=blk(I+key+' .stato',phoDecl(st));});
            return;
          }
          const k=kindOf(o),sl=k==='i'?I+key+' > .icona':I+T[k]+key,cl=k==='z'?clipEls(o).map(e=>', '+cssId(e)+'.zone'+key).join(''):'';
          L.forEach(st=>{c+=stRules(st,Object.assign(expQ(ids.get(st.id),k),{base:sl+cl,cur:false,h:k==='z'?sl+':hover':null}));});
          if(k==='z')phAll(o).forEach((q,i)=>{if(q.p)L.forEach(st=>{c+=blk(cssId(phElId(o,i))+'.stato'+key,phoDecl(st,!!q.follow));});});
        });
      });
      return c;
    }
    function folEls(){
      const out=[];
      S.objects.forEach(s=>{
        phAll(s).forEach((I,i)=>{if(!I.p)return;const r=folRule(s,'opacity',I);if(r)out.push({s:s,r:r,p:'opacity',el:phElId(s,i)});});
        if(s.t==='label'&&expEl(s)){const r=folRule(s,'text');if(r)out.push({s:s,r:r,p:'text'});}
      });
      return out;
    }
    function bindRules(){
      const out=[],seen={};
      RULS().forEach(r=>{
        if(rKind(r)!=='data'||!rOk(r))return;
        const x=rFol(r);if(!isBind(x))return;
        const T=rOn(r).filter(id=>{
          const o=tgtOf(id);if(!o||bgOf(id))return false;
          if(isGrp(o)?!members(id).some(q=>!isEl(q)||expEl(q)):isEl(o)&&!expEl(o))return false;
          if(x.p==='mo'&&!moDrv(x))return false;
          if(bKind(x)==='fr'&&!(isGrp(o)?members(id):[o]).some(q=>pfCon(q).length))return false;
          if((x.p==='fv'||x.p==='gp')&&!(isGrp(o)?members(id):[o]).some(isLn))return false;
          const P=x.p==='mo'?moOf(moDrv(x)).pp:[x.p];if(P.every(p=>seen[id+'|'+p]))return false;P.forEach(p=>{seen[id+'|'+p]=1;});return true;
        });
        if(T.length)out.push({r:r,x:x,T:T});
      });
      return out;
    }
    function bindEls(b){
      const out=[];
      const st=b.x.p==='mo'?moDrv(b.x):null,cp=()=>{
        const ids=stIds();
        b.T.forEach(id=>{const o=tgtOf(id);(isGrp(o)?members(id):[o]).forEach(q=>pfCon(q).forEach(st=>{const e=pfId(ids.get(st.id),q,'');if(out.indexOf(e)<0)out.push(e);}));});
      };
      if(bKind(b.x)==='fr'){cp();return out;}
      b.T.forEach(id=>{
        out.push(id);const o=tgtOf(id);
        if((bindTf(b.x)||b.x.p==='sp')&&!isGrp(o)&&!isEl(o)){
          phAll(o).forEach((I,i)=>{if(I.p&&(I.follow||b.x.p==='sp'))out.push(phElId(o,i));});
          out.push(...clipEls(o));
        }
      });
      if(st&&moFam(st,'r'))cp();
      if(st&&moOf(st).pp.indexOf('op')>=0)b.T.forEach(id=>{const o=tgtOf(id);if(isGrp(o)||isEl(o))return;
        phAll(o).forEach((I,i)=>{const e=phElId(o,i);if(I.p&&out.indexOf(e)<0)out.push(e);});});
      return out;
    }
    function bindYAML(b){
      const k=rCs(b.r)[0],E2=bindEls(b),js=bindJS(k,b.x,b.r);
      return '  # '+b.T.join(', ')+': '+b.r.id+'\n  - entity: '+k.e+'\n    element: '+E2[0]+'\n    tap_action: false\n    hover_action: false\n'+
        '    state_action:\n      service: floorplan.style_set\n      service_data:\n        elements:\n'+E2.map(e=>'          - '+e+'\n').join('')+
        '        style: |\n          >\n'+js.map(l=>'          '+l).join('\n')+'\n';
    }
    function pivPx(pv,b){
      const q=pv||'c',x=q.indexOf('l')>=0?b.x0:q.indexOf('r')>=0?b.x1:(b.x0+b.x1)/2,y=q[0]==='t'?b.y0:q[0]==='b'?b.y1:(b.y0+b.y1)/2;
      return f(x)+'px '+f(y)+'px';
    }
    function pivKw(pv){const q=pv||'c';return (q.indexOf('l')>=0?'left':q.indexOf('r')>=0?'right':'center')+' '+(q[0]==='t'?'top':q[0]==='b'?'bottom':'center');}
    function bindTr(o,x){
      const st=isGrp(o)?null:stysOf(o).filter(q=>stHas(q,'t')).slice(-1)[0],d=st?Math.max(0,+st.dur||0):150,e=st&&st.ease||'ease';
      const P=BIND_C[x.p],L=trList();if(L.indexOf(P)<0)L.push(P);
      return 'transition: '+L.map(q=>q+' '+(q===P?bindTm(x):d)+'ms '+(q===P?'ease':e)).join(', ');
    }
    function moExpr(M,V,p,u,fn){
      fn=fn||(v=>v);const L=M.ps,v0=fn(L[0].v[p]);let e=f(v0)+u,ch=false;
      for(let i=0;i+1<L.length;i++){
        const d=fn(L[i+1].v[p])-fn(L[i].v[p]);if(!d)continue;ch=true;
        const a=L[i].t/100,w=(L[i+1].t-L[i].t)/100,q=!a&&w===1?'var('+V+', 0)':'(var('+V+', 0)'+(a?' - '+a:'')+')'+(w===1?'':' / '+w);
        e+=' + '+f(d)+u+' * clamp(0, '+q+', 1)';
      }
      return ch?'calc('+e+')':f(v0)+u;
    }
    const moSc=(v,ay)=>ay==='x'?v+' 1':ay==='y'?'1 '+v:v;
    const MO_CSS={op:'opacity',mx:'translate',my:'translate',mr:'rotate',ms:'scale',fc:'fill',fr:'rotate',sw:'stroke-width',sc:'stroke',fs:'font-size',ls:'letter-spacing'};
    function moDecls(st,V,el,F){
      const M=moOf(st),has=p=>M.pp.indexOf(p)>=0&&(!F||F.indexOf(MO_FAM[p])>=0),E=(p,u,fn)=>moExpr(M,V,p,u,fn),d=[];
      if(has('op'))d.push('opacity: '+E('op',''));
      if(has('mx')||has('my')){
        const X=has('mx')?E('mx','px'):'0px',Y=has('my')?E('my','px'):'0px';
        d.push('translate: '+(el?'calc(var(--ta, 1) * '+X+' + var(--tb, 0) * '+Y+') calc(var(--tc, 0) * '+X+' + var(--td, 1) * '+Y+')':X+' '+Y));
      }
      if(has('mr')){const R=E('mr','deg');d.push('rotate: '+(el?'calc(var(--tr, 1) * '+R+')':R));}
      if(has('ms')){const Z=E('ms','',v=>v/100);d.push('scale: '+(st.ay==='x'?Z+' 1':st.ay==='y'?'1 '+Z:Z));}
      if(has('fc'))d.push('fill: rgba('+[0,1,2].map(j=>E('fc','',v=>hexRgb(v)[j])).join(', ')+', '+E('fa','')+')');
      if(has('fr'))d.push('rotate: '+E('fr','deg'));
      if(has('sc'))d.push('stroke: rgba('+[0,1,2].map(j=>E('sc','',v=>hexRgb(v)[j])).join(', ')+', '+E('sa','')+')');
      if(has('sw'))d.push('stroke-width: '+E('sw',''));
      if(has('fs'))d.push('font-size: '+E('fs','px'));
      if(has('ls'))d.push('letter-spacing: '+E('ls','px'));
      return d;
    }
    function moTr(o,V,tm,P,te){
      const st=stysOf(o).filter(q=>stHas(q,'t')).slice(-1)[0],d=st?Math.max(0,+st.dur||0):150,e=st&&st.ease||'ease';
      const L=trList().filter(q=>P.indexOf(q)<0).map(q=>q+' '+d+'ms '+e).concat(tm?[V+' '+tm+'ms '+(te||'ease')]:[]);
      return 'transition: '+(L.length?L.join(', '):'none');
    }
    function moBindCSS(x,V,id,o,I,g,k,bx,own,ph,blk,pk){
      const st=moDrv(x);if(!st)return '';
      const el=k==='l'||k==='i',tm=bindTm(x),vt=tm?['transition: '+V+' '+tm+'ms '+(x.te||'ease')]:[];
      const P=moOf(st).pp.map(p=>MO_CSS[p]),W=moDecls(st,V,el,'w'),Sd=moDecls(st,V,el,'s'),R=pk?[]:moDecls(st,V,el,'r');
      let c='';
      if(R.length){const L=(g?members(id):[o]).filter(q=>pfCon(q).length);if(L.length)c+=blk(L.map(q=>'.pf-'+slug(q.id)+' .fr'),R.concat(vt));}
      if(g&&Sd.length)c+=blk([I+' .zone',I+' .etichetta',I+' .icona'],Sd)+(vt.length&&!W.length?blk([I],vt):'');
      const opd=W.filter(q=>q.indexOf('opacity:')===0),P2=!g&&k==='z'&&opd.length?phAll(o).map((q,i)=>q.p?cssId(phElId(o,i))+(pk?'.stato'+pk:''):null).filter(Boolean):[];
      if(P2.length)c+=blk(P2,opd.concat([moTr(o,V,tm,P,x.te)]));
      const d=g?W:W.concat(Sd);if(!d.length)return c;
      if(!W.some(q=>q.indexOf('opacity:')!==0))return c+blk(own,d.concat(g?vt:[moTr(o,V,tm,P,x.te)]));
      const dp=W.filter(q=>q.indexOf('opacity:')!==0);
      c+=blk(own,d.concat(g?vt:[moTr(o,V,tm,P,x.te)]));
      if(ph.length)c+=blk(ph,dp.concat([moTr(o,V,tm,P,x.te)]));
      const pv=moPv(st)||'c',po=el?['transform-box: fill-box','transform-origin: '+pivKw(pv)]:['transform-box: view-box','transform-origin: '+pivPx(pv,bx)];
      c+=blk(own.concat(ph).map(lvSel),po);
      if(g)c+=agCSS(id,I,dp)+agCSS(id,'#livelli '+I,po);
      return c;
    }
    function bindCSS(){
      const B=bindRules();if(!B.length)return '';
      const blk=(sel,d)=>sel.join(', ')+'{\n  '+d.join(';\n  ')+';\n}\n';
      let c='\n/* Properties following a value: variable --zv-r<n> written by floorplan.style_set. */\n';
      B.forEach(b=>{
        const x=b.x,V=bindVar(b.r),O=bindOut(x);
        b.T.forEach(id=>{
          const o=tgtOf(id),I=cssId(id),g=isGrp(o),k=g?'g':kindOf(o),bx=g?grpBox(id):bboxOf([o]);
          const rg=!g&&k==='z'?clipEls(o).map(cssId):[];
          const ph=(!g&&k==='z'?phAll(o).map((q,i)=>q.p&&(q.follow||x.p==='sp')?cssId(phElId(o,i)):null).filter(Boolean):[]).concat(rg);
          const own=k==='i'?[I+' > .icona']:[I];
          if(x.p==='mo'){c+=moBindCSS(x,V,id,o,I,g,k,bx,own,ph,blk);return;}
          if(bindTf(x)){
            const vv=x.p==='mr'?'var('+V+', '+f(O[0])+'deg)':x.p==='ms'?'var('+V+', '+f(O[0]/100)+')':'var('+V+', '+f(O[0])+'px)';
            const el=k==='l'||k==='i',d=[];
            if(x.p==='mx')d.push('translate: '+(el?'calc(var(--ta, 1) * '+vv+') calc(var(--tc, 0) * '+vv+')':vv+' 0px'));
            else if(x.p==='my')d.push('translate: '+(el?'calc(var(--tb, 0) * '+vv+') calc(var(--td, 1) * '+vv+')':'0px '+vv));
            else if(x.p==='mr')d.push('rotate: '+(el?'calc(var(--tr, 1) * '+vv+')':vv));
            else d.push('scale: '+vv);
            d.push(g?'transition: '+BIND_C[x.p]+' '+bindTm(x)+'ms ease':bindTr(o,x));
            c+=blk(own.concat(ph),d);
            const po=el?['transform-box: fill-box','transform-origin: '+pivKw(x.pv)]:['transform-box: view-box','transform-origin: '+pivPx(x.pv,bx)];
            c+=blk(own.concat(ph).map(lvSel),po);
            if(g)c+=agCSS(id,I,d)+agCSS(id,'#livelli '+I,po);
          }
          else if(x.p==='op')c+=blk(own,['opacity: var('+V+', '+f(O[0])+')'].concat(g?[]:[bindTr(o,x)]));
          else if(x.p==='fr'){
            const L=(g?members(id):[o]).filter(q=>pfCon(q).length);
            if(L.length)c+=blk(L.map(q=>'.pf-'+slug(q.id)+' .fr'),['rotate: var('+V+', '+f(O[0])+'deg)','transition: rotate '+bindTm(x)+'ms ease']);
          }
          else if(x.p==='gp'||x.p==='fv'){
            (g?members(id):[o]).filter(isLn).forEach(q=>{
              const P=g?I+' '+cssId(q.id):I;
              if(x.p==='gp'){const b0=lnGp(q);c+=blk([P+' .lg'],['stroke-dasharray: var('+V+', '+f(b0==null?100:b0)+') 100','transition: stroke-dasharray '+bindTm(x)+'ms ease']);return;}
              const v=lnFv(q);
              [['.lp',lnPer(q)],['.ld',lnDd(q)?lnDg(q):0]].forEach(([e,Pd])=>{if(Pd)c+=blk([P+' '+e],['animation-duration: calc('+f(Pd)+'s / var('+V+', '+f(Math.abs(v)||1)+'))',
                'animation-direction: var('+V+'d, '+(v<0?'reverse':'normal')+')','animation-play-state: var('+V+'p, '+(v?'running':'paused')+')']);});
            });
          }
          else if(x.p==='fc'){
            const c0=hexRgb(O[0]),fb='rgba('+c0.join(', ')+', '+bindA(x,0)+')';
            c+=blk(g?[I+' .zone',I+' .etichetta',I+' .icona']:own,['fill: var('+V+', '+fb+')'].concat(g?[]:[bindTr(o,x)]));
          }
          else{
            const D=bindD(x),sel=g?['#livelli '+I,I+' .zone',I+' .etichetta',I+' .icona']:ph.length?own.concat(ph).map(lvSel):own;
            const ad=['animation-duration: var('+V+', '+D+'s)','animation-play-state: var('+V+'p, running)'];
            c+=blk(sel,ad);
            if(g)c+=agCSS(id,'#livelli '+I,ad);
          }
        });
      });
      return c;
    }
    const amVar=st=>'--am-'+stIds().get(st.id).replace(/^st-/,'');
    function amCSS(){
      const R=amGoR();if(!R.length)return '';
      const blk=(sel,d)=>sel.join(', ')+'{\n  '+d.join(';\n  ')+';\n}\n',T={z:'.zone',l:'.etichetta',i:''};
      let c='\n/* Apply motion, go to: data-m="<n>" brings the variable of each motion to the pose of the rule, from where it is,\n'+
        '   with the duration and easing of the motion. */\n';
      R.forEach(r=>{
        const v=actMo(r),key='[data-m="'+rNum(r)+'"]',M=mvMos(v),t=f(moPt(v)/100),E2=tapStyEls(v);
        (v.to||[]).forEach(id=>{
          const o=tgtOf(id);if(!o||isBgl(o))return;
          const g=isGrp(o),C=g?members(id).filter(q=>isCard(q)&&cdCfg(q)):isCard(o)&&cdCfg(o)?[o]:[];
          C.forEach(q=>M.forEach(st=>{
            const V=amVar(st),W=moDecls(st,V,false,'w');if(!W.length)return;
            c+=blk([cssId(q.id)+key+' .cds'],[V+': '+t].concat(W,['transition: '+V+' '+moDur(st)+'ms '+moEase(st),'transform-origin: '+pivKw(moPv(st)||'c')]));
          }));
          if(isCard(o)||E2.indexOf(id)<0)return;
          const k=g?'g':kindOf(o),bx=g?grpBox(id):bboxOf([o]),I=cssId(id)+(g?'':T[k])+key;
          const own=k==='i'?[cssId(id)+key+' > .icona']:[I];
          const rg=k==='z'?clipEls(o).map(e=>cssId(e)+'.zone'+key):[];
          const ph=(k==='z'?phAll(o).map((q,i)=>q.p&&q.follow?cssId(phElId(o,i))+'.stato'+key:null).filter(Boolean):[]).concat(rg);
          const hold=[id].concat(k==='z'?phAll(o).map((q,i)=>q.p?phElId(o,i):null).filter(Boolean).concat(clipEls(o)):[]).map(e=>cssId(e)+key);
          M.forEach(st=>{
            const V=amVar(st);
            c+=blk(hold,[V+': '+t])+moBindCSS({p:'mo',mo:st.id,tm:moDur(st),te:moEase(st)},V,id,o,g?I:cssId(id)+key,g,k,bx,own,ph,blk,key);
          });
        });
      });
      return c;
    }
    function folYAML(x){
      const k=rCs(x.r)[0],js=followJS(k,rFol(x.r)),el=x.p==='text'?x.s.id:x.el||x.s.id+'.stato';
      const head='  # '+el+': '+x.r.id+'\n  - entity: '+k.e+'\n    element: '+el+'\n    tap_action: false\n    hover_action: false\n';
      if(x.p==='text')return head+'    state_action:\n      service: floorplan.text_set\n      service_data: |\n        >\n'+js.map(l=>'        '+l).join('\n')+'\n';
      return head+'    state_action:\n      service: floorplan.style_set\n      service_data:\n        element: '+el+'\n        style: |\n          >\n'+
        js.map(l=>'          '+l).join('\n')+'\n';
    }
    function ruleCSS(){
      const X=ruleEls();if(!X.length)return '';
      const by=new Map(X.map(x=>[x.id,x])),ids=stIds(),T={z:'.zone',l:'.etichetta',i:'.icona'};
      let c='\n/* Rules: classes r-<n> from floorplan.class_set, written from the last rule to the first:\n'+
            '   the first rule of the list wins. Same specificity for single targets and groups. */\n';
      const R=condOk(),sy=R.filter(rSymI);
      if(sy.length)c+='/* Icon symbols of the rules: hidden until their rule is true. */\n'+
        sy.map(r=>'.icona > path.st-r'+rNum(r)+'{ display: none; }\n').join('');
      R.slice().reverse().forEach(r=>{
        const key='r-'+rNum(r);
        rOn(r).forEach(id=>{
          const x=by.get(id);if(!x||x.k==='c')return;
          const I=cssId(id);
          if(x.k==='b'){idsStys(rSty(r)).forEach(st=>{const d=phoDecl(st);if(d.length)c+=I+'.sfondo-livello.'+key+'{\n  '+d.join(';\n  ')+';\n}\n';});return;}
          const kinds=x.k==='g'?x.kinds:[x.k];
          const sel=k=>x.k==='g'?I+'.'+key+' '+T[k]:k==='i'?I+'.'+key+' > .icona':I+T[k]+'.'+key;
          const z0=x.k==='z'?tgtOf(id):null,cl=z0?clipEls(z0).map(e=>', '+cssId(e)+'.zone.'+key).join(''):'';
          kinds.forEach(k=>idsStys(rSty(r)).forEach(st=>{
            const sl=sel(k);
            c+=stRules(st,Object.assign(expQ(ids.get(st.id),k),{base:sl+(k==='z'?cl:''),cur:false,h:k==='z'?sl+':hover':null,noTf:x.k==='g',noAn:x.k==='g'&&anWhole(st)}));
          }));
          if(x.k==='g')idsStys(rSty(r)).forEach(st=>{
            if(anWhole(st))c+=anPiece(st,I+'.'+key,ids.get(st.id),id,grpBox(id))+agAn(st,I+'.'+key,ids.get(st.id),id,grpBox(id));
            if(!stX(st))return;
            const d=tfDecl(stState(st,'n'),'g');if(stHas(st,'t'))d.push('transition: '+trX(st));
            c+=I+'.'+key+'{\n  '+d.join(';\n  ')+';\n}\n'+agCSS(id,I+'.'+key,d);
          });
          const z=x.k==='z'?tgtOf(id):null;
          const phs=x.k==='g'?(x.ph?[{s:I+'.'+key+' .stato'}]:[]):z?phAll(z).map((q,i)=>({e:phElId(z,i),fo:!!q.follow})).filter(o=>by.has(o.e)).map(o=>({s:cssId(o.e)+'.stato.'+key,fo:o.fo})):[];
          phs.forEach(ph=>idsStys(rSty(r)).forEach(st=>{const d=phoDecl(st,ph.fo);if(d.length)c+=ph.s+'{\n  '+d.join(';\n  ')+';\n}\n';}));
          if(rSymI(r)&&kinds.indexOf('i')>=0){
            const b=I+'.'+key+' .icona > path';
            c+=b+':not(.st-r'+rNum(r)+'){ display: none; }\n'+b+'.st-r'+rNum(r)+'{ display: inline; }\n';
          }
        });
      });
      return c;
    }
    function buildSVG(){return outF(buildSVG0);}
    function buildSVG0(){
      if(!GM)return giro(buildSVG);
      const wi=S.objects.filter(hasImg);
      const dl=['    <clipPath id="bordo-tela"><rect x="0" y="0" width="'+S.w+'" height="'+S.h+'"/></clipPath>']
        .concat(PGS().map(p=>{const A=pgA(p);return '    <clipPath id="area-'+esc(p.id)+'"><rect x="'+A.x+'" y="'+A.y+'" width="'+A.w+'" height="'+A.h+'"/></clipPath>';}))
        .concat(...wi.map(s=>['    <clipPath id="clip-'+slug(s.id)+'">'+tagOf(s)+'</clipPath>'].concat(tfClip(s)&&!agOf(s).length?
          ['    <clipPath id="clip-'+slug(s.id)+'-m">'+tagOf(s,'id="'+esc(clipElId(s))+'" class="'+esc(zcls(s))+'"')+'</clipPath>']:[])));
      const sids=stIds();
      const ud=elDefUse();
      stDefs(defSt(),'zone').concat(ud.l?stDefs(defOf(-1),'etichetta'):[],ud.i?stDefs(defOf(-2),'icona'):[],
        ...styles().filter(Boolean).map(x=>stDefs(x,sids.get(x.id)))).forEach(l=>dl.push('    '+l));
      const fdg=new Set();
      wi.forEach(s=>{const M=fdMv(s);fdStys(s).forEach(st=>{
        const k=sids.get(st.id);
        if(!fdg.has(k)){fdg.add(k);dl.push('    '+fdGrad(stState(st,'n'),'fdg-'+k));}
        dl.push('    '+fdMask(s,'fd-'+slug(s.id)+'-'+k,'fdg-'+k,fdOf(stState(st,'n')).k==='t'));
        if(M.indexOf(st)>=0)dl.push('    '+fdMaskMv(s,'fd-'+slug(s.id)+'-'+k+'-m','id="'+esc(fdElId(s,st))+'" class="'+esc(zcls(s))+'"','fdg-'+k));
      });});
      coExp().forEach(o=>dl.push('    '+coPat(o.s,o,'pat-'+o.c+'-n-'+o.sf,o.c&&pfStys(o.s).some(x=>stIds().get(x.id)===o.c)?pfId(o.c,o.s,''):'grad-'+o.c+'-n')));
      let d=dl.length?'  <defs>\n'+dl.join('\n')+'\n  </defs>\n':'';
      let bg='';
      BGS().forEach(b=>{if(b.p)bg+='  <image id="'+esc(b.id)+'" class="'+bglCls(b)+'" href="'+esc(full(b.p))+'" x="0" y="0" width="'+S.w+'" height="'+S.h+'" preserveAspectRatio="'+par()+'" pointer-events="none"/>\n';});
      const deco=decoIds();
      const lines=s=>{
        const items=[];
        if(isCard(s))return items;
        if(isEl(s)){
          if(!expEl(s))return items;
          const p0=posOf(s);
          if(s.t==='label'){
            const lid=deco.get(s);
            const lt=elTr(s,p0);
            const tp=tapEl(s);
            items.push((lt?'<g'+lt+'>':'')+'<text id="'+esc(lid)+'" x="'+f(p0.x)+'" y="'+f(p0.y)+'" font-size="'+(s.size||18)+'"'+
              ' text-anchor="middle" dominant-baseline="middle"'+(tp?'':' pointer-events="none"')+' class="'+ecls(s,lid)+(tp?' tocca':'')+'">'+esc(freeTxt(s)||'—')+'</text>'+pfTags(s,'')+(lt?'</g>':''));
            return items;
          }
          const sz=s.size||28,k=sz/24,et=elTr(s,p0).replace(/^ transform="|"$/g,'');
          const tr=(et?et+' ':'')+'translate('+f(p0.x-sz/2)+','+f(p0.y-sz/2)+') scale('+f(k)+')';
          const sy=symList(s);
          const inner=sy.length?'<path class="st-off" d="'+(icons.get(s.icon)||'')+'"/>'+sy.map(q=>'<path class="st-r'+q.n+'" d="'+(icons.get(q.icon)||'')+'"/>').join('')
            :'<path d="'+(icons.get(s.icon)||'')+'"/>';
          const did=deco.get(s),tp=tapEl(s);
          const hit=tp?'<rect class="hit" width="24" height="24" fill="transparent" stroke="none"/>':'';
          items.push('<g id="'+esc(did)+'"'+(tp?' class="tocca"':' pointer-events="none"')+' transform="'+tr+'"><g class="'+ecls(s,did)+'">'+hit+inner+'</g>'+pfTags(s,'')+'</g>');
          return items;
        }
        if(hasImg(s)){
          const mu=phMulti(s),d0=phDef(s),mv=tfClip(s),ag=agOf(s);
          if(ag.length){
            const R=ag.slice().reverse();
            items.push('<mask id="mask-'+slug(s.id)+'" maskUnits="userSpaceOnUse" x="'+(-S.w)+'" y="'+(-S.h)+'" width="'+(3*S.w)+'" height="'+(3*S.h)+'">'+
              R.map(g=>'<g class="fg-'+slug(g)+'">').join('')+tagOf(s,(mv?'id="'+esc(clipElId(s))+'" class="'+esc(zcls(s))+'" ':'')+'fill="#fff"')+R.map(()=>'</g>').join('')+'</mask>');
          }
          phAll(s).forEach((I,i)=>{
            if(!I.p)return;
            const R=imgRect(phView(s,I)),a=ag.length&&!I.follow;
            const im='<image id="'+esc(phElId(s,i))+'" class="'+phoCls(s,i)+(mu&&i!==d0?' spenta':'')+'" href="'+esc(full(I.p))+
              '" x="'+f(R.x)+'" y="'+f(R.y)+'" width="'+f(R.w)+'" height="'+f(R.h)+
              '" preserveAspectRatio="'+R.par+'" '+(a?'mask="url(#mask-'+slug(s.id)+')"':'clip-path="url(#clip-'+slug(s.id)+(mv&&!I.follow?'-m':'')+')"')+' pointer-events="none"/>';
            items.push(a?ag.map(g=>'<g class="fa-'+slug(g)+'"><g class="fb-'+slug(g)+'">').join('')+im+ag.map(()=>'</g></g>').join(''):im);
          });
        }
        if(isLn(s)){
          items.push('<g id="'+esc(s.id)+'" class="'+esc(zcls(s))+'" fill="transparent"'+(thruOn(s)?' pointer-events="none"':'')+'>'+lnInner(s,{pl:lnBound(s,'gp')})+'</g>');
          return items;
        }
        const g=geom(s),at=Object.entries(g.a).map(([k,v])=>k+'="'+v+'"').join(' ');
        items.push('<'+g.tag+' id="'+esc(s.id)+'" class="'+esc(zcls(s))+'" fill="transparent" '+at+(thruOn(s)?' pointer-events="none"':'')+'/>');
        const pf=pfTags(s,'');if(pf)items.push(pf);
        return items;
      };
      const gids=groupIds();
      const level=(C,ind,F)=>{
        const out=[];
        unitsIn(C).forEach(u=>{
          if(F&&!F(u.list[0]))return;
          if(u.key==='s'){lines(u.list[0]).forEach(l=>out.push(ind+l));return;}
          const inner=level(u.key,ind+'  ',F);
          if(inner.length)out.push(ind+'<g id="'+esc(gids.get(u.key)||u.key)+'" class="gruppo">',...inner,ind+'</g>');
        });
        return out;
      };
      let items;
      if(!hasPgs())items=level(null,'    ').concat(cdLines(()=>true,'    '));
      else{
        items=[];
        PGS().forEach(p=>{
          items.push('    <g clip-path="url(#area-'+esc(p.id)+')">','      <g id="'+esc(p.id)+'" class="pagina">',
            ...level(null,'        ',q=>q.pg===p.id),...cdLines(q=>q.pg===p.id,'        '),'      </g>','    </g>');
        });
        items.push(...level(null,'    ',q=>!q.pg),...cdLines(q=>!q.pg,'    '));
      }
      const body=items.length?'  <g id="livelli"'+(hasPgs()?' class="pg-'+esc(PGS()[0].id)+'"':'')+'>\n'+items.join('\n')+'\n  </g>\n':'';
      const tela=bg+body?'  <g clip-path="url(#bordo-tela)">\n'+(bg+body).replace(/^(?=.)/gm,'  ')+'  </g>\n':'';
      const H=swEls().H,gs=H.length?'  <g id="gesti">\n'+H.map(x=>'    <g id="'+x.el+'"/>\n').join('')+'  </g>\n':'';
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+S.w+' '+S.h+'" preserveAspectRatio="xMidYMid meet">\n'+d+tela+gs+'</svg>\n';
    }
    function buildCSS(){return outF(buildCSS0);}
    function buildCSS0(){
      if(!GM)return giro(buildCSS);
      const ids=stIds(),sl=styles().filter(Boolean),co=coExp();
      let c='/* Zones without styles: transparent, no border, still tappable. */\n'+stRules(defSt(),expQ(''))+'\n'+
      (S.objects.some(isLn)?'/* Open lines without styles: theme text colour, 2 px. */\n.zone.linea{ stroke: var(--primary-text-color, #1e2430); stroke-width: 2; }\n\n':'')+
      '/* Zones with a photo start transparent: their styles add only the sections they set,\n'+
      '   hover included (only a style with hover on lights them). */\n'+
      '.zone-img{ fill: transparent; stroke: none; }\n'+
      '.zone-img:hover{ fill: transparent; }\n\n'+
      (sl.length?'/* Project styles, partial: each one sets only its sections, over the base above.\n'+
        '   A zone has the classes st-<name> of its styles; the rule written later wins.\n'+
        '   Gradients and glows are in the defs of panel.svg. */\n'+
        sl.map(x=>stRules(x,expQ(ids.get(x.id)))).join('')+'\n':'')+
      (co.length?'/* Callouts with a leader line: the gradient spans the body only,\n'+
        '   the line takes the colour of the body edge next to it. */\n'+co.map(coRules).join('')+'\n':'')+
      '/* Zone photos: opacity, blend and transition come from the zone styles and live here, not\n'+
      '   inline: floorplan.style_set rewrites the style attribute and would drop them. */\n'+
      '.stato{ pointer-events: none; }\n'+
      '/* ha-floorplan sets pointer-events: all !important on every element of the SVG:\n'+
      '   photos, labels and icons must still let taps through to the zone underneath. */\n'+
      '#livelli .stato, #livelli .etichetta, #livelli .icona, #livelli .icona *{ pointer-events: none !important; }\n';
      const thr=S.objects.filter(thruOn);
      if(thr.length)c+='/* Zones that let taps through to what is underneath. */\n'+thr.map(q=>'#livelli #'+q.id+(isLn(q)?', #livelli #'+q.id+' *':'')).join(', ')+'{ pointer-events: none !important; }\n';
      const els=S.objects.filter(expEl);
      if(els.length){
        c+='\n/* Labels and icons do not catch taps:\n   the zone underneath stays in charge, even if the element is in front. */\n'+
           '.etichetta, .icona{ pointer-events: none; }\n';
        const ud=elDefUse(),ids=stIds();
        if(ud.l)c+='/* Labels without styles: theme text colour. */\n'+stRules(defOf(-1),expQ('','l'));
        if(ud.i)c+='/* Icons without styles: theme text colour, on the inner group. */\n'+stRules(defOf(-2),expQ('','i'));
        styles().filter(Boolean).forEach(x=>{
          ['l','i'].forEach(k=>{
            if(els.some(e=>kindOf(e)===k&&styIds(e).indexOf(x.id)>=0))c+=stRules(x,expQ(ids.get(x.id),k));
          });
        });
      }
      const so=S.objects.filter(q=>!isCard(q)&&(!isEl(q)||expEl(q))&&soConf(stysOf(q)));
      if(so.length){
        c+='\n/* Objects with their own order of styles: the last one written wins. */\n';
        so.forEach(q=>{const k=kindOf(q),I=':where('+cssId(q.id)+')',sc=v=>k==='i'?I+' > '+v:I+v;
          stysOf(q).forEach(x=>{const Q=expQ(ids.get(x.id),k);Q.base=sc(Q.base);if(Q.h)Q.h=sc(Q.h);c+=stRules(x,Q);});});
      }
      if(S.objects.some(q=>expEl(q)&&tapEl(q)))c+='\n/* Labels and icons with a tap action catch taps. */\n'+
        '.tocca{ cursor: pointer; }\n'+
        '#livelli .etichetta.tocca, #livelli .tocca .icona, #livelli .tocca .icona *{ pointer-events: all !important; }\n';
      const SM=swEls().M,TA={};
      S.objects.forEach(q=>{
        const m=SM[q.id];if(!m||isCard(q))return;
        const h=!!(m.l||m.r),v=!!(m.u||m.d),t=h&&v?'none':h?'pan-y':'pan-x';(TA[t]=TA[t]||[]).push(cssId(q.id));
      });
      if(Object.keys(TA).length)c+='\n/* Objects with a swipe: the finger does not scroll the dashboard along the swipe. */\n'+
        ['pan-y','pan-x','none'].filter(t=>TA[t]).map(t=>TA[t].join(', ')+'{ touch-action: '+t+'; }\n').join('');
      const fdAny=styles().some(x=>x&&stHas(x,'v'));
      S.objects.filter(hasImg).forEach(s=>{
        const FD=fdStys(s),MV=fdMv(s);
        phAll(s).forEach((I,i)=>{
          if(!I.p)return;
          const P=phoOf(stysOf(s),!!I.follow),win=agOf(s).length&&!I.follow;
          const o=folRule(s,'opacity',I)?'var(--zv, 0)':P.o==null?1:P.o;
          const fv=FD.map(st=>{const k=stIds().get(st.id);return '  --fd-'+k+': url(#'+(win?'mask-'+slug(s.id):'fd-'+slug(s.id)+'-'+k+(!I.follow&&MV.indexOf(st)>=0?'-m':''))+');\n';}).join('')+
            (win&&fdAny?'  --fd-none: url(#mask-'+slug(s.id)+');\n':'')+(P.v!=null&&P.v!=='none'?'  '+fdDecl(P.v)+';\n':'');
          c+='.s-'+phSlug(s,i)+'{\n  opacity: '+o+';\n'+(P.m&&P.m!=='normal'?'  mix-blend-mode: '+P.m+';\n':'')+fv+
             (P.x?tfDecl(P.x,'p').map(d=>'  '+d+';\n').join(''):'')+(P.t?'  transition: '+P.t+';\n':'')+'}\n';
        });
      });
      const FC=S.objects.filter(hasImg).map(s=>fdMv(s).map(st=>{const e=cssId(fdElId(s,st));return e+e+'{ fill: url(#fdg-'+stIds().get(st.id)+') !important; stroke: none !important; opacity: 1 !important; filter: none !important; mix-blend-mode: normal !important; }\n';}).join('')).join('');
      if(FC)c+='/* Fades following the shape of a zone that moves: copies of the shape in the masks, with its movement and the gradient. */\n'+FC;
      if(S.objects.some(s=>agOf(s).length))c+='/* Windows of the photos anchored to the canvas in groups that move: white, whatever the zone looks like. */\n'+
        '#livelli mask *{ fill: #fff !important; stroke: none !important; opacity: 1 !important; filter: none !important; mix-blend-mode: normal !important; }\n';
      if(S.objects.some(phMulti))c+='/* Zones with several photos: only the chosen one shows (class spenta on the others). */\n'+
        '#livelli .stato.spenta{ opacity: 0 !important; }\n';
      const BL=BGS().filter(b=>b.p);
      if(BL.length)c+='\n/* Background layers: over the background, under the objects. Look from their styles;\n'+
        '   the rules (r-<n>) win, as for the photos. */\n';
      BL.forEach(b=>{
        const P=phoOf(stysOf(b));
        c+='.s-'+slug(b.id)+'{\n  opacity: '+(P.o==null?1:P.o)+';\n'+(P.m&&P.m!=='normal'?'  mix-blend-mode: '+P.m+';\n':'')+
           (P.t?'  transition: '+P.t+';\n':'')+'}\n';
      });
      if(hasPgs())c+='\n/* Pages: only the current page shows (class pg-<page> on #livelli). */\n'+
        '#livelli .pagina{ display: none; }\n'+PGS().map(p=>'#livelli.pg-'+p.id+' #'+p.id).join(', ')+'{ display: inline; }\n'+pgTrCSS();
      return tapReCSS(c+lnCSS()+tfObjCSS()+pfCSS()+ruleCSS()+tapStyCSS()+anZoneCSS()+frCSS()+bindCSS()+cdCSS()+amCSS());
    }
    function lnBound(s,p){return bindRules().some(b=>b.x.p===p&&b.T.some(id=>id===s.id||isGrp(tgtOf(id))&&members(id).indexOf(s)>=0));}
    function lnCSS(){
      const L=S.objects.filter(isLn);if(!L.length)return '';
      let c='\n/* Open lines: taps along the stroke only (band lh). Ends, dots and gauge take the colour of the line. */\n'+
        '#livelli .linea *{ pointer-events: none !important; }\n#livelli .linea .lh{ pointer-events: stroke !important; }\n';
      const K=new Set();let a='',kf='';
      L.forEach(q=>{
        const v=lnFv(q);if(!v&&!lnBound(q,'fv'))return;
        [['.lp',lnPer(q)],['.ld',lnDd(q)?lnDg(q):0]].forEach(([e,P])=>{
          if(!P)return;const n='zlf-'+String(f(P)).replace('.','_');
          if(!K.has(n)){K.add(n);kf+='@keyframes '+n+'{ to{ stroke-dashoffset: -'+f(P)+'px; } }\n';}
          a+='  '+cssId(q.id)+' '+e+'{ animation: '+n+' '+f(v?P/Math.abs(v):1)+'s linear infinite'+(v<0?' reverse':'')+(v?'':' paused')+'; }\n';
        });
      });
      if(a)c+='/* Flow: dashes and dots run along the line. */\n'+kf+'@media (prefers-reduced-motion: no-preference){\n'+a+'}\n';
      return c;
    }
    function pfCSS(){
      let c='';
      S.objects.forEach(s=>{const v=pfVars(s,'');if(v)c+=cssId(s.id)+'{ '+v+'; }\n';});
      return c?'\n/* Conic fills, and gradients spread over a group or the canvas: each object uses its own copy (after\n   the object),\n'+
        '   with true angles on zones; a conic has a group .fr that turns around its centre. */\n.pf .fr{ transform-box: view-box; transform-origin: 0 0; }\n'+c:'';
    }
    function frCSS(){
      if(!styles().some(isFr))return '';
      const ids=stIds(),K=new Set();let c='',kf='';
      const put=(st,sel)=>{
        if(!st||!sel.length)return;
        const A=anOf(st,stState(st,'n'),'z',null,'r');if(!A)return;
        const n='anim-'+ids.get(st.id)+'-fr';
        if(!K.has(n)){K.add(n);kf+='@keyframes '+n+'{ '+A.kf+' }\n';}
        c+='  '+sel.join(', ')+'{ animation: '+n+' '+A.sh+'; }\n';
      };
      S.objects.forEach(s=>{
        if(!pfCon(s).length)return;
        const P='.pf-'+slug(s.id)+' .fr',I=cssId(s.id),T=[s.id].concat(chainOf(s));
        const sel=(id,k)=>id!==s.id?cssId(id)+k+' '+P:s.t==='icon'?I+k+' '+P:I+k+' ~ '+P;
        put(stysOf(s).filter(isFr).slice(-1)[0],[P]);
        condOk().slice().reverse().forEach(r=>{const st=idsStys(rSty(r)).filter(isFr).slice(-1)[0];if(st)put(st,rOn(r).filter(id=>T.indexOf(id)>=0).map(id=>sel(id,'.r-'+rNum(r))));});
        tapLys().slice().reverse().forEach(q=>{const x=q.x,st=idsStys(x.sty).filter(isFr).slice(-1)[0];if(st)put(st,(x.to||[]).filter(id=>T.indexOf(id)>=0).map(id=>sel(id,q.key)));});
      });
      return c?'\n/* Turning conic fills (fill rotation): on the group .fr of the copies of each object. */\n'+kf+
        '@media (prefers-reduced-motion: no-preference){\n'+c+'}\n':'';
    }
    function pubDir(){
      const fo=String(self._folder||'').replace(/^\/+|\/+$/g,'');
      if(fo==='www')return '/local';
      if(fo.indexOf('www/')===0)return '/local/'+fo.slice(4);
      return null;
    }
    function projDir(){
      const pd=pubDir()||'/local/ada_studio';
      return proj?pd+'/'+proj:(S.base||pd);
    }
    function yamlWarn(){
      let y=pubDir()?'':'# The folder config/'+self._folder+' is not under www: the browser cannot read the files.\n';
      if(!proj)y+='# No project open: files are written to the root of the working folder.\n';
      return y;
    }
    function buildYAML(){return outF(buildYAML0);}
    function buildYAML0(){
      if(!GM)return giro(buildYAML);
      return yamlWarn()+'type: custom:floorplan-card\nfull_height: true\nconfig: '+projDir()+'/panel-config.yaml\n';
    }
    function buildConf(){return outF(buildConf0);}
    function buildConf0(){
      if(!GM)return giro(buildConf);
      const v='?v='+(S.ver||0);
      const dir=projDir();
      let y=yamlWarn()+'image: '+dir+'/panel.svg'+v+'\n'+
         'stylesheet: '+dir+'/panel.css'+v+'\n'+cdConfYAML()+'defaults:\n  hover_action: hover-info\n  tap_action: more-info\n';
      const X=ruleEls(),P=tapEls().concat(swEls().H),D=folEls(),BD=bindRules(),bad=RULS().filter(r=>!rOk(r)).length;
      y+=X.length||P.length||D.length||BD.length?'rules:\n'+P.map(tapYAML).join('')+X.map(ruleYAML).join('')+D.map(folYAML).join('')+BD.map(bindYAML).join('')
        :'rules: []\n# No rules to write: the dashboard shows the base look of every object.\n';
      if(bad)y+='# '+bad+(bad===1?' incomplete rule is':' incomplete rules are')+' not written.\n';
      const imgs=S.objects.filter(hasImg);
      if(imgs.length||BGS().some(b=>b.p)){
        y+='\n# Expected images:\n';
        BGS().forEach(b=>{if(b.p)y+='#   '+full(b.p)+'\n';});
        imgs.forEach(s=>phAll(s).forEach(I=>{if(I.p)y+='#   '+full(I.p)+'\n';}));
      }
      return y;
    }
    function refreshOut(){clearTimeout(outT);E.out.textContent=tab==='svg'?buildSVG():tab==='yaml'?buildYAML():tab==='conf'?buildConf():buildCSS();}
    function queueOut(){clearTimeout(outT);outT=setTimeout(refreshOut,200);}
    $('#close').onclick=()=>mdGo('edit');
    $('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b)return;tab=b.dataset.x;
      root.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.x===tab));refreshOut();});
    async function clip(t){
      let ok=false;
      if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(t);ok=true;}catch(_){}}
      if(!ok){const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';
        document.body.appendChild(a);a.select();try{ok=document.execCommand('copy');}catch(_){}document.body.removeChild(a);}
      return ok;
    }
    $('#copy').onclick=async()=>{
      refreshOut();
      const ok=await clip(E.out.textContent);
      $('#copy').textContent=ok?'Copied':'Copy manually';setTimeout(()=>$('#copy').textContent='Copy',1400);
    };
    $('#dl').onclick=()=>{refreshOut();download(tab==='svg'?'panel.svg':tab==='yaml'?'panel.yaml':tab==='conf'?'panel-config.yaml':'panel.css',E.out.textContent,'text/plain');};
    function download(n,t,m){
      const u=URL.createObjectURL(new Blob([t],{type:m})),a=document.createElement('a');
      a.href=u;a.download=n;a.style.display='none';root.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(u),2000);
    }

    function errText(e){
      if(e==null)return 'unknown error';
      if(e===3)return 'connection to Home Assistant lost';
      if(typeof e!=='object')return String(e);
      return (e.body&&e.body.message)||e.message||e.error||e.code||'unknown error';
    }
    function conflictVer(err){
      if(!err)return null;
      if(err.code==='version_conflict'){const v=parseInt(err.message,10);return isNaN(v)?null:v;}
      const m=/version_conflict:(\d+)/.exec((err.body&&err.body.message)||err.message||'');
      return m?+m[1]:null;
    }
    const PV_MAX=256,PV=new Map();
    const pvWait=(pr,ms)=>Promise.race([pr,new Promise((res,rej)=>setTimeout(()=>rej(new Error('image timeout')),ms))]);
    function pvImg(u,px){
      const k=u+'|'+px;
      if(!PV.has(k)){
        while(PV.size>=40)PV.delete(PV.keys().next().value);
        PV.set(k,new Promise(res=>{
          const im=new Image();
          try{if(new URL(u,location.href).origin!==location.origin)im.crossOrigin='anonymous';}catch(e){}
          im.onload=()=>{
            try{
              const w=im.naturalWidth||px,h=im.naturalHeight||px,q=Math.min(1,px/Math.max(w,h));
              const c=document.createElement('canvas');
              c.width=Math.max(1,Math.round(w*q));c.height=Math.max(1,Math.round(h*q));
              c.getContext('2d').drawImage(im,0,0,c.width,c.height);
              res(c.toDataURL(/\.jpe?g(\?|$)/i.test(u)?'image/jpeg':'image/png',0.85));
            }catch(e){res('');}
          };
          im.onerror=()=>res('');
          const b=bust.get(u);
          im.src=b?u+(u.indexOf('?')<0?'?':'&')+'e='+b:u;
        }).then(v=>{if(!v)PV.delete(k);return v;}));
      }
      return PV.get(k);
    }
    async function pvMake(svg,css){
      const P=hasPgs()?pgA(PGS()[0]):{x:0,y:0,w:S.w,h:S.h};
      if(!(P.w>0&&P.h>0))return '';
      const k=PV_MAX/Math.max(P.w,P.h),W=Math.max(1,Math.round(P.w*k)),H=Math.max(1,Math.round(P.h*k));
      const px=Math.min(2048,Math.max(32,Math.ceil(Math.max(S.w,S.h)*k*2)));
      svg=svg.replace(/<foreignObject\b([^>]*)>[\s\S]*?<\/foreignObject>/g,(m,a)=>{
        const v=n=>{const r=new RegExp('\\s'+n+'="([^"]*)"').exec(a);return r?r[1]:'0';};
        return '<rect x="'+v('x')+'" y="'+v('y')+'" width="'+v('width')+'" height="'+v('height')+'" rx="4" fill="#808080" fill-opacity="0.35"/>';
      });
      const HREF=/\shref="([^"#][^"]*)"/g,une=t=>t.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
      const us=[...new Set([...svg.matchAll(HREF)].map(m=>m[1]))].filter(u=>!/^data:/.test(u));
      const got=new Map(await Promise.all(us.map(async u=>[u,await pvWait(pvImg(une(u),px),20000).catch(()=>'')])));
      svg=svg.replace(HREF,(m,u)=>got.has(u)?' href="'+got.get(u)+'"':m)
        .replace(/^<svg\b[^>]*>/,'<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="'+P.x+' '+P.y+' '+P.w+' '+P.h+
          '" preserveAspectRatio="xMidYMid slice"><style><![CDATA[\n'+css.replace(/\]\]>/g,'')+
          '\n*{animation:none !important;transition:none !important}\n]]></style>');
      const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
      try{
        const im=await pvWait(new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('page not drawn'));i.src=url;}),20000);
        const c=document.createElement('canvas');c.width=W;c.height=H;
        const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(im,0,0,W,H);
        return c.toDataURL('image/jpeg',0.82);
      }finally{URL.revokeObjectURL(url);}
    }
    async function pvSend(name,files){
      const h=self._hass;
      if(!h||!h.callWS||!name)return 'Home Assistant not available';
      try{
        let g=null;try{g=document.createElement('canvas').getContext('2d');}catch(e){}
        if(!g)return null;
        const fl=n=>(files.find(x=>x.name===n)||{}).content;
        const sc=fl('panel.svg')!=null?[fl('panel.svg'),fl('panel.css')]:giro(()=>[buildSVG(),buildCSS()]);
        const data=await pvMake(sc[0],sc[1]||'');
        if(!data)return 'empty page';
        await h.callWS({type:'ada_studio/preview',project:name,data:data});
        return '';
      }catch(err){return errText(err);}
    }
    function saveProject(prevOver){return serverSave(false,prevOver);}
    function push(prevOver){return serverSave(true,prevOver);}
    let svOk=false,svW='';
    async function serverSave(full,prevOver){
      pmShow(false);svOk=false;
      const h=self._hass;
      if(!h){stamp('Home Assistant not available',true);return;}
      if(!full&&!proj){stamp('no project open',true);return;}
      const need=[];
      giro(()=>S.objects.forEach(x=>{if(x.t==='icon'&&expEl(x)){need.push(x.icon||'');symList(x).forEach(q=>need.push(q.icon));}}));
      let pend=full?need.filter(n=>!icons.get(n)):[];
      if(pend.length){
        stamp('resolving icons…');
        await Promise.all([...new Set(pend)].map(n=>{if(icons.get(n)==='')icons.delete(n);return icWait(n);}));
        pend=need.filter(n=>!icons.get(n));
      }
      if(pend.length){stamp('icon not resolved: '+(pend[0]||'(empty)'),true);return;}
      let cdW='';
      if(full&&S.objects.some(isCard)){
        stamp('reading the dashboards…');
        const bad=await cdRefresh();
        if(bad.length)cdW=bad.length+(bad.length===1?' linked card':' linked cards')+' not found: '+bad.join(', ');
        if(S.objects.some(cdCfg)&&!await cdFpOk())cdW=(cdW?cdW+' · ':'')+'the installed ha-floorplan has no card_set';
        if(inspObj&&isCard(inspObj))cdHint(inspObj.id);
      }
      if(full){const n=spUsed().size;if(n)cdW=(cdW?cdW+' · ':'')+n+(n===1?' placeholder':' placeholders')+' not linked';}
      const prev=prevOver==null?(S.ver||0):prevOver,pub0=S.pub;
      S.ver=prev+1;
      if(full)S.pub=S.ver;else if(S.pub==null)S.pub=prev;
      const files=!full?[]:[
        {name:'panel.svg',content:buildSVG()},
        {name:'panel.css',content:buildCSS()},
        {name:'panel.yaml',content:buildYAML()},
        {name:'panel-config.yaml',content:buildConf()}
      ];
      if(proj)files.unshift({name:'progetto.json',content:JSON.stringify(S,null,2)});
      const body={files:files};
      if(proj){body.project=proj;body.prev=prev;}
      stamp('writing…');
      const ok=res=>{
        if(proj)rifH=hsh(norm(JSON.parse(files[0].content)));
        svOk=true;svW=cdW;
        flush();
        saved=JSON.stringify(S);
        const msg=(full?'written '+((res&&res.written)||[]).join(', ')+' (v'+S.ver+')':'project saved (v'+S.ver+'), dashboard unchanged')+(cdW?' · '+cdW:'');
        stamp(msg,!!cdW);
        if(drawerOpen)refreshOut();
        if(proj)projList();
        if(proj){
          const nm=proj;
          pvSend(nm,files).then(e=>{if(e)stamp(msg+' · preview not updated: '+e,true);else if(e===''&&proj===nm)projList();});
        }
        pdRefresh();
      };
      const fail=async err=>{
        S.ver=prev;if(pub0==null)delete S.pub;else S.pub=pub0;
        const cur=conflictVer(err);
        if(cur!=null&&proj){
          stamp('newer version on server (v'+cur+')',true);
          let q=null;try{const r=await wsCall({type:'ada_studio/project_open',project:proj});q=JSON.parse(r.content||'{}');}catch(_){}
          if(fmtOf(q)>FORMAT){stamp('“'+proj+'” was saved by a newer version of Ada Studio: update Ada Studio',true);return;}
          if(confirm('Project “'+proj+'” was saved from another device (version '+cur+').\n\n'+
                     'OK: overwrite with this one.\nCancel: reload the server version and lose unsaved changes.'))
            await serverSave(full,cur);
          else await loadProject(proj,true);
          return;
        }
        stamp('failed: '+errText(err),true);
      };
      if(h.callWS){
        try{ok(await h.callWS(Object.assign({type:'ada_studio/save'},body)));return;}
        catch(err){
          const c=err&&err.code;
          if(c!=='unknown_command'&&c!=='not_ready'){await fail(err);return;}
        }
      }
      try{
        if(!h.callApi)throw new Error('API not available');
        ok(await h.callApi('POST','ada_studio/save',body));
      }catch(err){await fail(err);}
    }
    $('#push').onclick=()=>push();
    $('#psave').onclick=()=>saveProject();
    function pmShow(on,list){
      if(!on)projOpen=false;
      E.pmenu.hidden=!on;E.pmb.setAttribute('aria-expanded',String(on));
      if(!on)return;
      E.pmcmd.hidden=!!list;E.pmlist.hidden=!list;
      const nd=!proj;['#psave','#pdash','#pdup','#pdel'].forEach(k=>{const b=$(k);if(b.disabled!==nd)b.disabled=nd;});
      const r=E.pmb.getBoundingClientRect();
      E.pmenu.style.left=Math.max(4,r.left)+'px';E.pmenu.style.top=(r.bottom+6)+'px';
    }
    const pmToggle=()=>{if(E.pmenu.hidden){pmsg('');pmShow(true,false);}else pmShow(false);};
    function pgBar(){
      const on=hasPgs(),t=on?pgName(pgOf(cpg())):'';
      if(E.pgb.hidden===on)E.pgb.hidden=!on;
      const n0=$('#pgnew0'),s0=$('#pgnew0s');if(n0.hidden!==on){n0.hidden=on;s0.hidden=on;}
      if(E.pgn.textContent!==t)E.pgn.textContent=t;
      if(!E.pgmenu.hidden)pgMenu();
    }
    function pgMenu(){
      const P=PGS(),c=cpg();
      const h=(P.length?P.map(p=>'<button type="button" role="menuitemradio" data-pgo="'+p.id+'" aria-checked="'+(p.id===c)+'">'+esc(pgName(p))+'</button>').join('')
        :'<button type="button" role="menuitemradio" aria-checked="true" disabled>Page 1</button>')+
        '<hr><button type="button" role="menuitem" data-pga="link"'+(P.length?'':' disabled')+'>Copy link</button>'+
        '<button type="button" role="menuitem" data-pga="new">New page</button>'+
        '<button type="button" role="menuitem" data-pga="del"'+(P.length<2?' disabled':'')+'>Delete page…</button>';
      if(E.pgmenu._h!==h){E.pgmenu._h=h;E.pgmenu.innerHTML=h;}
    }
    function pgShow(on){
      E.pgmenu.hidden=!on;E.pgb.setAttribute('aria-expanded',String(on));
      if(!on)return;
      pgMenu();
      const r=E.pgb.getBoundingClientRect();
      E.pgmenu.style.left=Math.max(4,r.left)+'px';E.pgmenu.style.top=(r.bottom+6)+'px';
    }
    E.pgb.addEventListener('click',()=>{pmShow(false);pgShow(E.pgmenu.hidden);});
    $('#pgnew0').onclick=()=>{pmShow(false);pgNew();};
    E.pgmenu.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||b.disabled)return;
      pgShow(false);
      if(b.dataset.pgo)pgGo(b.dataset.pgo);
      else if(b.dataset.pga==='new')pgNew();
      else if(b.dataset.pga==='del')pgDel();
      else if(b.dataset.pga==='link'){const p=pgOf(cpg());if(p&&p.ad){const t='#'+p.ad;clip(t).then(ok=>stamp(ok?'Copied '+t:'Copy manually: '+t,!ok));}}
    });
    root.addEventListener('pointerdown',e=>{
      if(E.pgmenu.hidden)return;
      const P=e.composedPath();if(P.indexOf(E.pgmenu)>=0||P.indexOf(E.pgb)>=0)return;
      pgShow(false);
    },true);
    function pgPanel(){
      const p=pgOf(cpg());if(!p){E.pgpanel.innerHTML='';return;}
      const A=pgA(p),P=PGS(),i=P.indexOf(p),T=pgTr(p),key=p.id+'|'+i+'|'+P.length+'|'+T.t;
      const nf=(l,k,v)=>'<label class="f">'+l+'<input class="num" data-pgf="'+k+'" type="number" step="1" value="'+v+'"></label>';
      if(E.pgpanel._k!==key){
        E.pgpanel._k=key;
        E.pgpanel.innerHTML='<h2>Page</h2>'+
          '<label class="f col">name<input class="num" data-pgf="n" type="text" autocomplete="off" value="'+esc(p.n||'')+'"></label>'+
          '<label class="f col">address<input class="num" data-pgf="ad" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="'+esc(p.ad||'')+'"></label>'+
          '<label class="f col">entry<span class="row">'+pgTrFields('pgf',T.t==='none'?null:T,false)+'</span></label>'+
          nf('x','x',A.x)+nf('y','y',A.y)+
          '<div class="row" style="margin-top:4px"><button class="btn" data-pgz="up"'+(i<=0?' disabled':'')+' title="Earlier in the list" aria-label="Earlier in the list">↑</button>'+
          '<button class="btn" data-pgz="dn"'+(i>=P.length-1?' disabled':'')+' title="Later in the list" aria-label="Later in the list">↓</button></div>';
      }
      E.pgpanel.querySelectorAll('[data-pgf]').forEach(f=>{
        if(f===root.activeElement)return;
        const k=f.dataset.pgf,v=k==='n'?(p.n||''):k==='ad'?(p.ad||''):k==='tt'?T.t:k==='tdir'?T.d:k==='tms'?String(T.ms):String(A[k]);
        if(f.value!==v)f.value=v;
      });
    }
    function pgInput(e,final){
      const t=e.target,k=t.dataset.pgf,p=pgOf(cpg());if(!k||!p)return;
      if(k==='n'){p.n=t.value;render();store(!!final);return;}
      if(k==='ad'){if(!final)return;const v=t.value.trim();if(v)p.ad=pgAdFree(v,p);t.value=p.ad;render();store(true);return;}
      if(k==='tt'){if(t.value==='none')['tt','tdir','tms'].forEach(q=>{delete p[q];});else{p.tt=t.value;delete p.tdir;}render();store(!!final);return;}
      if(k==='tdir'){p.tdir=t.value;render();store(!!final);return;}
      if(k==='tms'){const v=Math.round(parseFloat(t.value));if(!(v>0))return;p.tms=clamp(v,50,5000);render();store(!!final);return;}
      const v=parseFloat(t.value);if(!isFinite(v))return;
      const A=pgA(p),o={x:A.x,y:A.y,w:A.w,h:A.h};o[k]=Math.round(v);
      p.a=[o.x,o.y,o.w,o.h];render();store(!!final);
    }
    function pgSzPanel(){
      const n=E.pgsz;if(!hasPgs()){if(n.innerHTML)n.innerHTML='';return;}
      const A=pgA(PGS()[0]);
      if(!n.innerHTML)n.innerHTML='<hr class="psep"><h2>Pages</h2><label class="f">page width<input class="num" data-pgs="w" type="number" step="10"></label>'+
        '<label class="f">page height<input class="num" data-pgs="h" type="number" step="10"></label>'+
        '<div class="row" style="margin-top:4px"><button class="btn" data-pgs="fit">Whole canvas</button></div>';
      n.querySelectorAll('input[data-pgs]').forEach(f=>{if(f===root.activeElement)return;const v=String(A[f.dataset.pgs]);if(f.value!==v)f.value=v;});
    }
    function pgSzInput(e,final){
      const k=e.target.dataset.pgs;if(k!=='w'&&k!=='h'||!hasPgs())return;
      const v=Math.round(parseFloat(e.target.value));if(!(v>=10))return;
      PGS().forEach(p=>{const A=pgA(p);p.a=[A.x,A.y,k==='w'?v:A.w,k==='h'?v:A.h];});
      render();store(!!final);
    }
    E.pgsz.addEventListener('input',e=>pgSzInput(e,false));
    E.pgsz.addEventListener('change',e=>{pgSzInput(e,true);pgSzPanel();});
    E.pgsz.addEventListener('click',e=>{
      const b=e.target.closest('button[data-pgs]');if(!b||!hasPgs())return;
      settle();PGS().forEach(p=>{p.a=[0,0,S.w,S.h];});render();store(true);
    });
    E.pgpanel.addEventListener('input',e=>pgInput(e,false));
    E.pgpanel.addEventListener('change',e=>pgInput(e,true));
    E.pgpanel.addEventListener('click',e=>{
      const b=e.target.closest('[data-pgz]');if(!b||b.disabled)return;
      const p=pgOf(cpg()),P=PGS(),i=P.indexOf(p);if(!p)return;
      settle();
      {const j=b.dataset.pgz==='up'?i-1:i+1;if(j<0||j>=P.length)return;P.splice(i,1);P.splice(j,0,p);}
      render();store(true);
    });
    E.pmb.addEventListener('click',pmToggle);
    E.ptl.addEventListener('click',pmToggle);
    $('#popen').onclick=async()=>{projOpen=true;projRender();await projList();};
    $('#pback').onclick=()=>{projOpen=false;pmShow(true,false);};
    root.addEventListener('pointerdown',e=>{
      if(E.pmenu.hidden)return;
      const P=e.composedPath();if(P.indexOf(E.pmenu)>=0||P.indexOf(E.pmb)>=0||P.indexOf(E.ptl)>=0)return;
      pmShow(false);
    },true);
    function pdRefresh(){
      const un=dirty(),st=!un&&!!proj&&S.pub!=null&&S.pub!==S.ver;
      const t=un?'●':st?'○':'',ti=un?'Not saved':st?'Dashboard not updated':'';
      if(E.pdot.textContent!==t)E.pdot.textContent=t;
      if(E.pdot.hidden!==!t)E.pdot.hidden=!t;
      if(E.pdot.title!==ti)E.pdot.title=ti;
    }

    function wsCall(msg){
      const h=self._hass;
      if(!h||!h.callWS)return Promise.reject(new Error('Home Assistant not available'));
      return h.callWS(msg);
    }
    function pmsg(t,bad){E.pmsg.textContent=t||'';E.pmsg.style.color=bad?'var(--error-color,#c33)':'';if(t)stamp(t,bad);}
    function dirty(){return !!proj&&saved!==''&&JSON.stringify(S)!==saved;}
    function guard(){
      return !dirty()||confirm('Project “'+proj+'” has changes not saved to the server.\n'+
        'They stay as a draft in this browser only. Continue?');
    }
    function thumb(p){
      const dir=(pubDir()||'/local/ada_studio')+'/'+p.name+'/';
      if(p.pv)return '<img alt="" loading="lazy" src="'+esc(dir+'anteprima.jpg?v='+p.pv)+'">';
      if(!p.bg)return '<img alt="">';
      const u=/^(https?:|data:|\/)/.test(p.bg)?p.bg:dir+String(p.bg).replace(/^\/+/,'');
      return '<img alt="" loading="lazy" src="'+esc(u)+'">';
    }
    function projRender(){
      const rows=projects.map(p=>{
        const when=p.at?new Date(p.at*1000).toLocaleDateString(LOC()):'—',v1=p.format>0&&!pOpens(p);
        return '<div class="pr'+(p.name===proj?' on':'')+(v1?' v1':'')+'" data-p="'+esc(p.name)+'">'+thumb(p)+
          '<div style="min-width:0;flex:1"><div class="nm">'+esc(p.name)+'</div>'+
          '<div class="sb">'+(v1?(p.format===1?'1.x, not supported':'newer version, not supported')
            :(p.objects||0)+' objects · v'+(p.ver||0)+' · '+when)+'</div></div>'+
          (v1?'<button class="btn" type="button" data-pdel="'+esc(p.name)+'">Delete</button>':'')+'</div>';
      }).join('');
      put(E.plist,rows||'<p class="hint" style="margin:6px">No projects</p>');
      pverRender();
      if(projOpen)pmShow(true,true);else if(!E.pmenu.hidden&&!E.pmlist.hidden)pmShow(false);
      const nm=proj||(opening?'opening…':'no project');
      if(E.pname.textContent!==nm)E.pname.textContent=nm;
      pdRefresh();
    }
    function pverRender(){
      const n=$('#pver'),c=self._panel&&self._panel.config||{},sv=c.version?String(c.version):'?';
      const t=MODULE_VERSION+(sv===MODULE_VERSION?'':' · server '+sv);
      if(n.textContent!==t)n.textContent=t;
      n.classList.toggle('diff',sv!==MODULE_VERSION);
    }
    async function projList(){
      try{const r=await wsCall({type:'ada_studio/projects'});projects=r.projects||[];}
      catch(err){projects=[];pmsg('project list not available: '+errText(err),true);}
      projRender();
    }
    async function loadProject(name,discard){
      let r;
      try{r=await wsCall({type:'ada_studio/project_open',project:name});}
      catch(err){pmsg('open failed: '+errText(err),true);return false;}
      let q=null;try{q=JSON.parse(r.content||'{}');}catch(_){}
      const fm=fmtOf(q);
      if(fm===1){pmsg('“'+name+'”: '+V1_MSG+'. Start a new project with New and draw it again.',true);return false;}
      if(fm!==FORMAT&&fm!==0){pmsg('“'+name+'”: project from a newer version: not supported.',true);return false;}
      if(fm===0)q=fresh();
      const srv=norm(q),srvH=hsh(srv);
      const b=discard?null:bozza(name);
      let use=q,resumed=false,rif=srvH;
      if(b&&norm(b)!==srv){
        const bv=+b.ver||0,sv=+q.ver||0,br=rifOf(name);
        if(br?br===srvH:bv===sv){use=b;resumed=true;}
        else if(confirm((bv<sv
            ?'Project “'+name+'” was saved from another device (version '+sv+
             ') after the changes made in this browser, which start from version '+bv+'.\n\n'
            :'This browser has changes to project “'+name+'” that do not start from the version on the server (version '+sv+').\n\n')+
            'OK: keep the changes from this browser (you will be asked before overwriting).\n'+
            'Cancel: use the server version; the changes in this browser are lost.')){use=b;rif=br;}
      }
      proj=name;S=Object.assign(fresh(),use);saved=srv;rifH=rif;opening=false;
      pick([]);selBg=selSt=selRu=selTe=false;pgStop();curPg=null;ruCur='';ruOpP=null;drR=null;drK=[];drC=null;selG=-1;draft=null;probes.clear();moTw.clear();flReset();if(flow)selRu=true;selTe=false;
      projOpen=false;
      try{localStorage.setItem(KEY+'-last',name);}catch(_){}
      mvCut=[];fields();chrome();projRender();fit();write();hist=[];hi=-1;snap(true);render();
      if(!resumed&&use===q){saved=JSON.stringify(S);pdRefresh();}
      pmsg(resumed?'Unsaved changes resumed (from v'+(S.ver||0)+'): save to server to share them.':'');
      stamp((resumed?'project “'+name+'” opened, unsaved changes resumed':'project “'+name+'” opened')+
        (mvCut.length?' · one motion per Apply motion, removed: '+mvCut.join(', '):''));
      mvCut=[];
      return true;
    }
    async function newProject(from,content){
      if(!guard())return;
      const raw=prompt(from?('Name of the copy of “'+from+'” (a-z, 0-9, - and _):')
                           :'New project name (a-z, 0-9, - and _):','');
      if(raw===null)return;
      const name=String(raw).trim().toLowerCase();
      if(!/^[a-z0-9_-]{1,40}$/.test(name)){pmsg('invalid name: a-z, 0-9, - and _ only',true);return;}
      const body=from?null:(content||JSON.stringify(Object.assign(fresh(),{ver:0}),null,2));
      try{await wsCall({type:'ada_studio/project_new',project:name,from:from||null,content:body});}
      catch(err){pmsg('create failed: '+errText(err),true);return;}
      await projList();
      await loadProject(name,true);
    }
    async function delProject(nm){
      const name=nm||proj;
      if(!name){pmsg('no project open',true);return;}
      const w=prompt('Delete “'+name+'” and everything in its folder, images included?\n'+
                     'Type the project name to confirm:','');
      if(w===null)return;
      if(String(w).trim()!==name){pmsg('name does not match: nothing deleted',true);return;}
      try{await wsCall({type:'ada_studio/project_delete',project:name});}
      catch(err){pmsg('delete failed: '+errText(err),true);return;}
      try{localStorage.removeItem(dkey(name));localStorage.removeItem(rkey(name));}catch(_){}
      const de=await dbDel(name);
      if(name!==proj){await projList();pmsg(de||'project “'+name+'” deleted',!!de);return;}
      proj='';saved='';rifH='';
      await projList();
      {const nx=projects.find(pOpens);if(nx&&await loadProject(nx.name,true)){if(de)pmsg(de,true);return;}}
      try{localStorage.removeItem(KEY+'-last');}catch(_){}
      S=fresh();drR=null;drK=[];drC=null;pick([]);fields();chrome();projOpen=true;projRender();render();
      pmsg(de||'project deleted',!!de);
    }
    const DB_ICON='mdi:floor-plan';
    const dbCfg=n=>(pubDir()||'/local/ada_studio')+'/'+n+'/panel-config.yaml';
    const dbSlug=n=>'ada-'+(String(n).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'project');
    function dbHas(c,u,d){
      if(!c||typeof c!=='object'||(d|0)>12)return false;
      if(c.type==='custom:floorplan-card'&&typeof c.config==='string'&&c.config.split('?')[0]===u)return true;
      return Object.values(c).some(v=>dbHas(v,u,(d|0)+1));
    }
    async function dbFind(n){
      const h=self._hass,L=await h.callWS({type:'lovelace/dashboards/list'}),A=Array.isArray(L)?L:[];
      const re=new RegExp('^'+dbSlug(n)+'(-\\d+)?$'),u=dbCfg(n),R=[];
      for(const x of A){
        if(!x||typeof x.url_path!=='string'||!re.test(x.url_path))continue;
        let c=null;try{c=await h.callWS({type:'lovelace/config',url_path:x.url_path});}catch(_){}
        if(dbHas(c,u))R.push(x);
      }
      return {A,R};
    }
    async function dbFp(){
      if(customElements.get('floorplan-card'))return true;
      try{const R=await self._hass.callWS({type:'lovelace/resources'});return (Array.isArray(R)?R:[]).some(x=>x&&/floorplan/i.test(String(x.url||'')));}
      catch(_){return true;}
    }
    const dbConf=n=>({title:n,views:[{title:n,path:'plan',type:'panel',
      cards:[{type:'custom:floorplan-card',full_height:true,config:dbCfg(n)}]}]});
    function dbGo(p){history.pushState(null,'','/'+p);window.dispatchEvent(new CustomEvent('location-changed',{detail:{replace:false}}));}
    async function dbCreate(){
      pmShow(false);
      const h=self._hass;
      if(!h||!h.callWS){stamp('Home Assistant not available',true);return;}
      if(!proj){stamp('no project open',true);return;}
      if(!pubDir()){stamp('the working folder is not under www: a dashboard cannot read the files',true);return;}
      if(!await dbFp()){stamp('ha-floorplan is not installed: install it from HACS',true);return;}
      const name=proj;
      await push();
      if(!svOk||proj!==name)return;
      stamp('creating the dashboard…');
      try{
        const {A,R}=await dbFind(name);
        const w=svW?' · '+svW:'';
        if(R.length){dbGo(R[0].url_path);stamp('dashboard “'+(R[0].title||R[0].url_path)+'” opened'+w,!!w);return;}
        const used=new Set(A.map(x=>x&&x.url_path)),b=dbSlug(name);
        let i=1,p=b;const nx=()=>{do{i++;p=b+'-'+i;}while(used.has(p));};
        if(used.has(p))nx();
        let d=null;
        while(!d){
          try{d=await h.callWS({type:'lovelace/dashboards/create',url_path:p,title:name,icon:DB_ICON,show_in_sidebar:true,require_admin:false});}
          catch(e){if(i<6&&e!==3&&!(e&&e.code===3)){nx();continue;}throw e;}
        }
        try{await h.callWS({type:'lovelace/config/save',url_path:p,config:dbConf(name)});}
        catch(e){if(d&&d.id)try{await h.callWS({type:'lovelace/dashboards/delete',dashboard_id:d.id});}catch(_){}throw e;}
        CD.dash=null;
        dbGo(p);stamp('dashboard “'+name+'” created'+w,!!w);
      }catch(err){stamp('dashboard not created: '+errText(err),true);}
    }
    async function dbDel(n){
      let R=[];try{R=(await dbFind(n)).R;}catch(_){return '';}
      for(const x of R){
        if(!confirm('Also delete the dashboard “'+(x.title||x.url_path)+'”?'))continue;
        try{await self._hass.callWS({type:'lovelace/dashboards/delete',dashboard_id:x.id});CD.dash=null;}
        catch(err){return 'project deleted, dashboard not deleted: '+errText(err);}
      }
      return '';
    }
    $('#pdash').onclick=()=>dbCreate();
    $('#pnew').onclick=()=>{pmShow(false);newProject(null);};
    $('#pdup').onclick=()=>{pmShow(false);if(!proj){pmsg('no project to duplicate',true);return;}newProject(proj);};
    $('#pdel').onclick=()=>{pmShow(false);delProject();};
    E.plist.addEventListener('click',async e=>{
      const d=e.target.closest('[data-pdel]');
      if(d){await delProject(d.dataset.pdel);return;}
      const r=e.target.closest('[data-p]');if(!r)return;
      const name=r.dataset.p;
      if(r.classList.contains('v1')){
        pmsg('“'+name+'”: '+(r.querySelector('.sb').textContent)+'. Start a new project with New and draw it again.',true);return;
      }
      if(name===proj){projOpen=false;projRender();return;}
      if(!guard())return;
      await loadProject(name);
    });
    let booted=false;
    async function boot(){
      if(booted)return;booted=true;
      await projList();
      let last='';try{last=localStorage.getItem(KEY+'-last')||'';}catch(_){}
      const has=n=>projects.some(p=>p.name===n&&pOpens(p));
      if(last&&has(last)&&await loadProject(last))return;
      if(opening){opening=false;const o=bozza('');S=o?Object.assign(fresh(),o):fresh();
        pick([]);fields();chrome();fit();hist=[];hi=-1;snap(true);render();stamp('');}
      if(projects.length){
        projOpen=true;projRender();
        pmsg('');
        return;
      }
      const old=bozza('');
      projOpen=true;projRender();
      if(old&&old.objects.length&&confirm('There are no projects on Home Assistant yet, but this browser has a project with '+
          old.objects.length+' objects.\n\nSave it as the first project?')){
        await newProject(null,JSON.stringify(Object.assign(fresh(),old,{ver:0}),null,2));
        return;
      }
      pmsg('');
    }

    let entItems=[],entN='',fontItems=null;
    function entityList(){
      const h=self._hass;if(!h||!h.states)return entItems;
      const ids=Object.keys(h.states),ck=ids.length+'|'+JSON.stringify(SPS());
      if(ck===entN)return entItems;
      entN=ck;ids.sort();
      const P=[],R=[];
      ids.forEach(id=>{
        const n=String((h.states[id].attributes&&h.states[id].attributes.friendly_name)||'');
        if(isSp(id))P.push({v:id,n:n,d:entDom(id),ph:true,k:(id+' @'+id.slice(11)+' '+n).toLowerCase()});
        else R.push({v:id,n:n,d:id.slice(0,id.indexOf('.')),k:(id+' '+n).toLowerCase()});
      });
      return entItems=P.concat(R);
    }
    let svcItems=[],svcSrc=null;
    function serviceList(){
      const h=self._hass,S2=h&&h.services;if(!S2)return svcItems;
      if(S2===svcSrc)return svcItems;
      svcSrc=S2;svcItems=[];
      Object.keys(S2).sort().forEach(d=>Object.keys(S2[d]||{}).sort().forEach(v=>{
        const id=d+'.'+v,n=String((S2[d][v]&&S2[d][v].name)||'');
        svcItems.push({v:id,n:n,d:d,k:(id+' '+n).toLowerCase()});
      }));
      return svcItems;
    }

    const FONTS=['Roboto','system-ui','sans-serif','serif','monospace','Arial','Helvetica','Verdana','Georgia','Times New Roman','Courier New','Trebuchet MS'];
    const DOMS=['light','switch','sensor','binary_sensor','cover','climate','fan','media_player','lock','button','script','scene','input_boolean','input_number','input_select'];
    const PK_MAX=80;
    function pickItems(){
      if(PK.kind==='fonts')return fontItems||(fontItems=FONTS.map(v=>({v:v,n:v,d:'',k:v.toLowerCase()})));
      if(PK.kind==='svcs')return serviceList();
      return entityList();
    }
    function pickOpen(field){
      if(PK.field===field&&!PK.el.hidden&&!PK.ed)return;
      if(!PK.el.hidden)pickClose();
      if(!PK.dk)PK.dk={};PK.dk[PK.kind||'ents']=PK.dom||'';
      PK.field=field;PK.kind=field.dataset.pick;PK.q='';PK.act=-1;PK.s.value='';PK.dom=PK.dk[PK.kind]||'';
      PK.el.classList.toggle('coarse',coarse);
      PK.el.hidden=false;field.setAttribute('aria-expanded','true');
      if(window.visualViewport){visualViewport.addEventListener('resize',pickRe);visualViewport.addEventListener('scroll',pickRe);}
      window.addEventListener('resize',pickRe);
      $('#detail').addEventListener('scroll',pickRe,{passive:true});
      pickDoms();pickList(true);pickPlace();
    }
    function pickClose(){
      if(PK.el.hidden)return;
      PK.el.hidden=true;
      if(PK.field)PK.field.setAttribute('aria-expanded','false');
      PK.field=null;PK.rows=[];PK.act=-1;PK.ed=null;
      if(window.visualViewport){visualViewport.removeEventListener('resize',pickRe);visualViewport.removeEventListener('scroll',pickRe);}
      window.removeEventListener('resize',pickRe);
      $('#detail').removeEventListener('scroll',pickRe);
    }
    function pickRe(){
      if(PK.el.hidden||PK.raf)return;
      PK.raf=requestAnimationFrame(()=>{PK.raf=0;if(!PK.el.hidden)pickPlace();});
    }
    function pickPlace(){
      const fl=PK.field;if(!fl)return;
      const hr=self.getBoundingClientRect(),fr=fl.getBoundingClientRect(),vv=window.visualViewport;
      if(!coarse){
        const dr=$('#detail').getBoundingClientRect();
        if(fr.bottom<dr.top||fr.top>dr.bottom)return pickClose();
      }
      const top0=Math.max(hr.top,vv?vv.offsetTop:hr.top),bot0=Math.min(hr.bottom,vv?vv.offsetTop+vv.height:hr.bottom);
      const W=Math.max(200,Math.min(hr.width-16,Math.max(fr.width,coarse?340:280)));
      let left=fr.left-hr.left;
      if(left+W>hr.width-8)left=hr.width-8-W;
      const st=PK.el.style;
      st.left=Math.max(8,left)+'px';st.width=W+'px';
      if(coarse){
        const t=top0-hr.top+8;
        st.top=t+'px';st.bottom='auto';st.maxHeight=Math.max(160,bot0-hr.top-t-8)+'px';
        return;
      }
      const want=340,below=bot0-fr.bottom-10,above=fr.top-top0-10;
      if(below>=Math.min(want,200)||below>=above){
        st.top=(fr.bottom-hr.top+4)+'px';st.bottom='auto';st.maxHeight=Math.max(120,Math.min(want,below))+'px';
      }else{
        st.top='auto';st.bottom=(hr.bottom-fr.top+4)+'px';st.maxHeight=Math.max(120,Math.min(want,above))+'px';
      }
    }
    function pickDoms(){
      if(PK.kind!=='ents'&&PK.kind!=='svcs'||PK.ed){PK.d.hidden=true;return;}
      const cnt={};
      pickItems().forEach(it=>{cnt[it.d]=(cnt[it.d]||0)+1;});
      const ds=Object.keys(cnt).sort((a,b)=>{
        const ia=DOMS.indexOf(a),ib=DOMS.indexOf(b);
        if(ia>=0||ib>=0)return (ia<0?99:ia)-(ib<0?99:ib);
        return a<b?-1:1;
      });
      if(PK.dom&&!cnt[PK.dom])PK.dom='';
      PK.d.hidden=ds.length<2;
      put(PK.d,'<button type="button" data-d="" aria-pressed="'+(!PK.dom)+'">all</button>'+
        ds.map(d=>'<button type="button" data-d="'+esc(d)+'" aria-pressed="'+(d===PK.dom)+'">'+esc(d)+'<span>'+cnt[d]+'</span></button>').join(''));
    }
    function stateText(id){
      const h=self._hass,st=h&&h.states&&h.states[id];if(!st)return '';
      const u=st.attributes&&st.attributes.unit_of_measurement;
      return st.state+(u?' '+u:'');
    }
    function pickList(toCur){
      const fl=PK.field;if(!fl)return;
      if(PK.ed)return spEdList();
      const q=PK.q.trim(),at=PK.kind==='ents'&&q[0]==='@';
      const words=(at?q.slice(1):PK.q).toLowerCase().split(/\s+/).filter(Boolean),cur=fl.value,items=pickItems();
      const all=items.filter(it=>(!at||it.ph)&&(PK.kind==='fonts'||!PK.dom||it.d===PK.dom)&&words.every(w=>it.k.indexOf(w)>=0));
      const rows=all.slice(0,PK_MAX);
      if(PK.kind==='fonts'&&!words.length)rows.unshift({v:'',n:'theme font'});
      const raw=coarse?PK.s.value.trim():'';
      if(raw&&!at&&!items.some(it=>it.v===raw))rows.unshift({v:raw,free:true});
      const slug=at?spSlug(q.slice(1)):'';
      if(slug&&!items.some(it=>it.v==='ada_studio.'+slug))rows.unshift({v:'ada_studio.'+slug,make:true});
      PK.rows=rows;
      if(PK.act>=rows.length)PK.act=-1;
      let h=rows.map((it,i)=>{
        const on=!it.free&&it.v===cur;
        let b;
        if(it.make)b='<span class="t"><b>+ placeholder “'+esc(it.v.slice(11))+'”</b><small>'+esc(PK.dom||'sensor')+'</small></span>';
        else if(it.free)b='<span class="t"><b>Use “'+esc(it.v)+'”</b><small>'+(PK.kind==='fonts'?'custom font':PK.kind==='svcs'?'custom service':'custom id, no entity')+'</small></span>';
        else if(PK.kind==='fonts'){
          const ff=it.v?txFam(it.v):'';
          b='<span class="t"><b'+(ff?' style="font-family:'+esc(ff)+'"':'')+'>'+esc(it.n)+'</b></span>';
        }
        else b='<span class="t"><b>'+esc(it.n||it.v)+'</b>'+(it.n?'<small>'+esc(it.v)+'</small>':'')+'</span><i>'+esc(PK.kind==='svcs'?'':stateText(it.v))+'</i>'+
          (it.ph?'<button type="button" class="pke" data-pke="'+i+'" title="Edit placeholder" aria-label="Edit placeholder">✎</button>':'');
        return '<div class="o'+(i===PK.act?' act':'')+(on?' cur':'')+(it.ph||it.make?' ph':'')+'" role="option" aria-selected="'+on+'" data-i="'+i+'">'+b+'</div>';
      }).join('');
      if(!rows.length)h='<div class="more">No results'+(PK.dom?' in '+esc(PK.dom):'')+'</div>';
      else if(all.length>PK_MAX)h+='<div class="more">'+(all.length-PK_MAX)+' more</div>';
      PK.l.innerHTML=h;
      if(toCur){
        const c=PK.l.querySelector('.cur');
        PK.l.scrollTop=c?Math.max(0,c.offsetTop-PK.l.clientHeight/2+c.offsetHeight/2):0;
      }
    }
    function pickMark(){
      PK.l.querySelectorAll('.o').forEach(n=>n.classList.toggle('act',+n.dataset.i===PK.act));
      const n=PK.l.querySelector('.o.act');if(n)n.scrollIntoView({block:'nearest'});
    }
    function pickChoose(i){
      const it=PK.rows[i],fl=PK.field;if(!it||!fl)return;
      if(it.make){
        settle();spNew(it.v);
        fl.value=it.v;
        PK.setting=true;
        try{fl.dispatchEvent(new Event('input',{bubbles:true}));}finally{PK.setting=false;}
        store(true);
        if(PK.el.hidden){
          const nf=fl.isConnected?fl:[...DET.querySelectorAll('input[data-pick="ents"]')].find(x=>x.value===it.v);
          if(!nf)return;
          pickOpen(nf);
        }
        return spEd(it.v);
      }
      pickClose();
      if(fl.value!==it.v){
        fl.value=it.v;
        PK.setting=true;
        try{fl.dispatchEvent(new Event('input',{bubbles:true}));}finally{PK.setting=false;}
        store(true);
      }
      if(!coarse)fl.focus();
      else{const a=root.activeElement;if(a&&a.blur)a.blur();}
    }
    function pickKey(e){
      if(PK.el.hidden){
        if(e.key==='ArrowDown'&&e.target.dataset.pick){e.preventDefault();pickOpen(e.target);}
        return;
      }
      const n=PK.rows.length;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();if(!n)return;
        const d=e.key==='ArrowDown'?1:-1;
        PK.act=PK.act<0?(d>0?0:n-1):(PK.act+d+n)%n;
        pickMark();
      }
      else if(e.key==='Enter'){
        e.preventDefault();
        if(PK.act>=0)pickChoose(PK.act);
        else if(e.target===PK.s&&n)pickChoose(0);
        else pickClose();
      }
      else if(e.key==='Escape'){e.preventDefault();const fl=PK.field;if(PK.ed)return spEdBack();pickClose();if(fl&&!coarse)fl.focus();}
      else if(e.key==='Tab')pickClose();
    }
    const DET=$('#detail');
    DET.addEventListener('click',e=>{const t=e.target.closest('input[data-pick]');if(t)pickOpen(t);});
    DET.addEventListener('input',e=>{
      const t=e.target;if(!t.dataset||!t.dataset.pick||PK.setting)return;
      if(PK.field!==t||PK.el.hidden)pickOpen(t);
      if(PK.ed){PK.ed=null;pickDoms();}
      PK.q=t.value;PK.act=-1;pickList(false);
    });
    DET.addEventListener('keydown',e=>{if(e.target.dataset&&e.target.dataset.pick)pickKey(e);});
    PK.s.addEventListener('input',()=>{if(PK.ed){PK.ed=null;pickDoms();}PK.q=PK.s.value;PK.act=-1;pickList(false);});
    PK.s.addEventListener('keydown',pickKey);
    $('#pkx').addEventListener('click',pickClose);
    PK.el.addEventListener('mousedown',e=>{if(e.target!==PK.s&&!e.target.closest('.phe input,.phe select,.phe textarea'))e.preventDefault();});
    PK.d.addEventListener('click',e=>{
      const b=e.target.closest('[data-d]');if(!b)return;
      PK.dom=b.dataset.d;PK.act=-1;pickDoms();pickList(true);
    });
    PK.l.addEventListener('click',e=>{
      const b=e.target.closest('[data-pke]');if(b){const it=PK.rows[+b.dataset.pke];if(it)spEd(it.v);return;}
      if(e.target.closest('[data-phb]'))return spEdBack();
      if(e.target.closest('[data-phx]'))return spDel(PK.ed);
      const o=e.target.closest('[data-i]');if(o)pickChoose(+o.dataset.i);
    });
    PK.l.addEventListener('change',e=>{const t=e.target.closest('[data-phf]');if(t&&PK.ed)spPut(PK.ed,t.dataset.phf,t.value);});
    PK.l.addEventListener('keydown',e=>{
      if(!PK.ed)return;
      if(e.key==='Escape'){e.preventDefault();spEdBack();}
      else if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();e.target.blur();}
    });

    const spSlug=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_]+/g,'_').replace(/^_+|_+$/g,'');
    const SP_DOMS=DOMS.concat(['number','select','input_text','text','vacuum','valve','water_heater','humidifier','siren','alarm_control_panel','weather','person','device_tracker','sun','timer','counter']);
    function spNew(e){
      if(spOf(e))return;
      const d=PK.dom&&SP_DOM.test(PK.dom)?PK.dom:'sensor';
      if(!Array.isArray(S.ph))S.ph=[];
      S.ph.push({e:e,d:d,s:TE_ONOFF.test(d)?'off':''});
      spSync();
    }
    const spAttrTxt=a=>Object.keys(a||{}).map(k=>{const v=a[k];return k+': '+(Array.isArray(v)?'['+v.join(', ')+']':String(v));}).join('\n');
    function spEd(e){
      if(!spOf(e))return;
      PK.ed=e;PK.act=-1;PK.d.hidden=true;spEdList();
      const n=PK.l.querySelector('[data-phf="n"]');if(n&&!coarse)n.focus();
    }
    function spEdBack(){PK.ed=null;pickDoms();pickList(true);}
    function spEdList(){
      const x=spOf(PK.ed);if(!x){PK.ed=null;return pickList(true);}
      const ds=SP_DOMS.indexOf(x.d)<0?[x.d].concat(SP_DOMS):SP_DOMS;
      PK.rows=[];
      put(PK.l,'<div class="phe"><div class="phh"><button type="button" class="btn" data-phb aria-label="Back">‹</button><b>@'+esc(x.e.slice(11))+'</b></div>'+
        '<label class="f">domain<select class="num" data-phf="d">'+ds.map(d=>'<option'+(d===x.d?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label>'+
        '<label class="f">imitates<select class="num" data-phf="m"><option value="">—</option>'+CK_M.map(m=>'<option'+(m===x.m?' selected':'')+'>'+m+'</option>').join('')+'</select></label>'+
        '<label class="f">name<input class="num" type="text" data-phf="n" value="'+esc(x.n||'')+'" placeholder="'+esc(x.e.slice(11))+'"></label>'+
        '<label class="f">state<input class="num" type="text" data-phf="s" value="'+esc(x.s)+'"></label>'+
        '<label class="f col">attributes<textarea class="num" data-phf="a" rows="3" spellcheck="false" placeholder="brightness: 255">'+esc(spAttrTxt(x.a))+'</textarea></label>'+
        '<button type="button" class="btn" data-phx>Delete placeholder</button></div>');
    }
    function spPut(e,f,v){
      const x=spOf(e);if(!x)return;
      settle();
      if(f==='d'){if(!SP_DOM.test(v))return;x.d=v;}
      else if(f==='n'){v=v.trim();if(v)x.n=v;else delete x.n;}
      else if(f==='m'){if(v&&CK_M.indexOf(v)<0)return;if(v)x.m=v;else delete x.m;if(isObj(S.clk))clkSet(S.clk.t);}
      else if(f==='s')x.s=v.trim();
      else if(f==='a'){const r=svcData(v);if(r.bad){stamp('attributes: line '+r.bad+' not understood',true);return;}
        if(Object.keys(r.o).length)x.a=r.o;else delete x.a;}
      render();store(true);
    }
    function spUses(e){
      let n=CAUS().filter(k=>k.e===e).length;
      RULS().forEach(r=>{const x=fxOf(r,'act');if(x&&x.e===e)n++;});
      S.objects.forEach(o=>{if(isCard(o)&&JSON.stringify(o.cfg||'').indexOf(e)>=0)n++;});
      return n;
    }
    function spDel(e){
      const x=spOf(e);if(!x)return;
      const n=spUses(e);
      if(n&&!confirm('Delete the placeholder '+e+'?\n\nIt is used '+n+(n>1?' times':' time')+'; those uses stay, without a state.'))return;
      settle();S.ph.splice(S.ph.indexOf(x),1);
      PK.ed=null;render();store(true);
      pickDoms();pickList(true);
    }
    root.addEventListener('pointerdown',e=>{
      if(PK.el.hidden)return;
      const p=e.composedPath();
      if(p.indexOf(PK.el)>=0||p.indexOf(PK.field)>=0)return;
      pickClose();
    },true);

    const GL={el:$('#gal'),r:$('#galr'),p:$('#galp'),s:$('#gals'),g:$('#galg'),q:$('#galq'),m:$('#galm'),t:$('#galt'),
      target:null,root:'project',path:'',roots:[],entries:[],more:0,shown:[],seq:0,
      paths:{},thumbs:new Map(),want:new Set(),pumping:false,io:null,busy:false,first:true,ask:null,up:null};
    const GAL_MAX=300,GAL_BATCH=12,GAL_KEEP=800;
    const I_DIR='M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z';
    const I_UP='M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z';
    const I_NO='<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4 18L20 6" stroke="currentColor" stroke-width="1.5"/></svg>';
    const galCtx=()=>({project:proj,root:GL.root,path:GL.path});
    const tKey=(c,e)=>c.root+'|'+c.path+'|'+e.name+'|'+e.at+'|'+e.size;
    const kb=n=>n<1048576?Math.max(1,Math.round(n/1024))+' KB':(n/1048576).toLocaleString(LOC(),{maximumFractionDigits:1})+' MB';
    function galMsg(t,bad){GL.m.textContent=t||'';GL.m.style.color=bad?'var(--error-color,#c33)':'';if(t&&bad)errShow(t);}
    function galErr(err){
      if(err&&err.code==='unknown_command')return 'command not available: restart Home Assistant after updating the files';
      return errText(err);
    }
    const galSt=()=>!!GL.target&&GL.target.stId!=null;
    const galBl=()=>!!GL.target&&GL.target.blId!=null;
    function galStP(){const x=galSt()?stById(GL.target.stId):null;return x&&x.st&&x.st.n?x.st.n:null;}
    function galCur(){
      if(galBl())return (bgOf(GL.target.blId)||{}).p||'';
      if(galSt()){const p=galStP();return (p&&p.ip)||'';}
      return (GL.target&&IM(GL.target).p)||'';
    }
    function galOpen(tg){
      pickClose();
      const s=sel>=0&&S.objects[sel];
      GL.target=tg||(s&&!isEl(s)?s:null);
      if(!GL.target)return;
      GL.t.textContent=galBl()?'Choose background':galSt()?'Choose style image':'Choose zone photo';
      $('#galh').textContent='';
      GL.el.hidden=false;GL.el.classList.remove('busy');GL.busy=false;
      GL.s.value='';GL.q.hidden=true;GL.ask=null;galMsg('');
      $('#galup').hidden=!proj;
      if(!proj){
        GL.roots=[];GL.entries=[];GL.shown=[];galBar();GL.g.innerHTML='';
        galMsg('Open or create a project first',true);return;
      }
      galLoad(GL.root==='project'?'project':GL.root);
      if(!coarse)setTimeout(()=>{if(!GL.el.hidden)GL.s.focus();},0);
    }
    function galClose(){
      if(GL.el.hidden)return;
      if(GL.up){GL.up.abort=true;upCancel(GL.up.id);GL.up=null;}
      GL.el.hidden=true;GL.seq++;GL.want.clear();GL.busy=false;GL.ask=null;
      if(GL.io)GL.io.disconnect();
    }
    async function galLoad(root,path){
      const seq=++GL.seq;
      GL.root=root||'project';
      GL.path=path!=null?path:(GL.root==='project'?'':(GL.paths[GL.root]||''));
      GL.want.clear();GL.q.hidden=true;GL.ask=null;
      galMsg('reading folder…');
      let r;
      try{r=await wsCall(Object.assign({type:'ada_studio/files'},galCtx()));}
      catch(err){
        if(seq!==GL.seq)return;
        if(GL.path&&err&&err.code==='not_found'){GL.paths[GL.root]='';galLoad(GL.root,'');return;}
        GL.entries=[];galBar();galGrid();galMsg('failed: '+galErr(err),true);return;
      }
      if(seq!==GL.seq)return;
      GL.roots=r.roots||[];GL.entries=r.entries||[];GL.more=r.more||0;GL.path=r.path||'';
      if(GL.root!=='project')GL.paths[GL.root]=GL.path;
      if(GL.first){
        GL.first=false;
        if(GL.root==='project'&&!GL.entries.length&&GL.roots.length>1){galLoad(GL.roots[1].id);return;}
      }
      galMsg('');galBar();galGrid();GL.g.scrollTop=0;
    }
    function rootLabel(r){
      if(!r)return '';
      if(r.id==='project')return 'Project';
      return GL.roots.filter(x=>x.id!=='project').length===1?'Media':'Media · '+r.label;
    }
    function galBar(){
      put(GL.r,GL.roots.map(r=>'<button type="button" data-r="'+esc(r.id)+'" aria-pressed="'+(r.id===GL.root)+'">'+esc(rootLabel(r))+'</button>').join(''));
      GL.r.hidden=GL.roots.length<2;
      let h='';
      if(GL.root!=='project'){
        const parts=GL.path?GL.path.split('/'):[];
        h='<button type="button" class="crumb" data-up="">'+esc(rootLabel(GL.roots.find(r=>r.id===GL.root)))+'</button>'+
          parts.map((p,i)=>' / <button type="button" class="crumb" data-up="'+esc(parts.slice(0,i+1).join('/'))+'">'+esc(p)+'</button>').join('');
      }
      put(GL.p,h);GL.p.hidden=!h;
    }
    function tileIn(c,e){
      const t=GL.thumbs.get(tKey(c,e));
      const img=!t?'<span class="ld"></span>':t.t?'<img alt="" draggable="false" src="'+t.t+'">':I_NO;
      let sub=kb(e.size);
      if(t&&t.w&&t.h){
        sub=t.w+'×'+t.h+' · '+sub;
        const a=S.w/S.h,fol=GL.target&&GL.target!=='bg'&&!galSt()&&!galBl()&&IM(GL.target).follow;
        if(!fol&&Math.abs(t.w/t.h-a)>a*0.01)sub='⚠ '+sub;
      }
      return '<div class="im">'+img+'</div><div class="nm">'+esc(e.name.slice(e.name.lastIndexOf('/')+1))+'</div><div class="sb">'+sub+'</div>';
    }
    function galGrid(){
      const words=GL.s.value.toLowerCase().split(/\s+/).filter(Boolean);
      const all=GL.entries.filter(e=>words.every(w=>e.name.toLowerCase().indexOf(w)>=0));
      const list=all.slice(0,GAL_MAX),c=galCtx(),cur=galCur();
      GL.shown=list;
      let h='';
      if(GL.root!=='project'&&GL.path&&!words.length)
        h+='<div class="gt dir" data-up="'+esc(GL.path.split('/').slice(0,-1).join('/'))+'" role="option"><div class="im"><svg viewBox="0 0 24 24"><path d="'+I_UP+'"/></svg></div><div class="nm">..</div><div class="sb">parent folder</div></div>';
      list.forEach((e,i)=>{
        if(e.dir){
          h+='<div class="gt dir" data-d="'+i+'" role="option" title="'+esc(e.name)+'"><div class="im"><svg viewBox="0 0 24 24"><path d="'+I_DIR+'"/></svg></div><div class="nm">'+esc(e.name)+'</div><div class="sb">folder</div></div>';
          return;
        }
        const on=GL.root==='project'&&cur===e.name;
        h+='<div class="gt'+(on?' cur':'')+'" data-f="'+i+'" role="option" aria-selected="'+on+'" title="'+esc(e.name)+'">'+tileIn(c,e)+'</div>';
      });
      if(!list.length){
        const m=words.length?'No matching photos':
          GL.root!=='project'?'No photos in this folder':
          'No photos in the project';
        h+='<p class="hint gnone">'+esc(m)+'</p>';
      }
      const rest=all.length-list.length+GL.more;
      if(rest>0)h+='<p class="hint gnone">'+rest+' more</p>';
      GL.g.innerHTML=h;
      galWatch();
    }
    function galWatch(){
      const need=e=>e&&!e.dir&&!GL.thumbs.has(tKey(galCtx(),e));
      if(!('IntersectionObserver' in window)){
        GL.shown.slice(0,48).forEach(e=>{if(need(e))GL.want.add(e.name);});galPump();return;
      }
      if(!GL.io)GL.io=new window.IntersectionObserver(ents=>{
        ents.forEach(en=>{
          if(!en.isIntersecting)return;
          GL.io.unobserve(en.target);
          const e=GL.shown[+en.target.dataset.f];
          if(need(e))GL.want.add(e.name);
        });
        galPump();
      },{root:GL.g,rootMargin:'0px 0px 240px 0px'});
      GL.io.disconnect();
      GL.g.querySelectorAll('[data-f]').forEach(n=>{if(need(GL.shown[+n.dataset.f]))GL.io.observe(n);});
    }
    async function galPump(){
      if(GL.pumping)return;
      GL.pumping=true;
      try{
        while(GL.want.size&&!GL.el.hidden){
          const c=galCtx(),seq=GL.seq,byName=new Map(GL.entries.map(e=>[e.name,e]));
          const names=[...GL.want].filter(n=>byName.has(n)).slice(0,GAL_BATCH);
          [...GL.want].slice(0,GAL_BATCH*4).forEach(n=>{if(!byName.has(n)||names.indexOf(n)>=0)GL.want.delete(n);});
          if(!names.length)continue;
          let r;
          try{r=await wsCall(Object.assign({type:'ada_studio/thumbs',names:names},c));}
          catch(err){if(seq===GL.seq)galMsg('thumbnails not available: '+galErr(err),true);GL.want.clear();break;}
          const th=(r&&r.thumbs)||{};
          names.forEach(n=>GL.thumbs.set(tKey(c,byName.get(n)),th[n]||{t:null,w:0,h:0}));
          while(GL.thumbs.size>GAL_KEEP)GL.thumbs.delete(GL.thumbs.keys().next().value);
          if(seq===GL.seq)galPaint(c,names);
        }
      }finally{GL.pumping=false;}
    }
    function galPaint(c,names){
      GL.g.querySelectorAll('[data-f]').forEach(n=>{
        const e=GL.shown[+n.dataset.f];
        if(e&&names.indexOf(e.name)>=0)n.innerHTML=tileIn(c,e);
      });
    }
    async function galCopy(name,as,over){
      const c=galCtx(),seq=GL.seq;
      GL.busy=true;GL.el.classList.add('busy');GL.q.hidden=true;
      galMsg(over?'overwriting…':'copying to project…');
      let r=null,fail=null;
      try{r=await wsCall(Object.assign({type:'ada_studio/file_copy',name:name,as:as||null,overwrite:!!over},c));}
      catch(err){fail=err;}
      GL.busy=false;GL.el.classList.remove('busy');
      if(seq!==GL.seq)return;
      if(fail){
        if(fail.code==='name_taken'){
          const m=String(fail.message||'').split('|');
          galAsk(name,m[1]||as||name,m[0]||'');return;
        }
        galMsg('copy failed: '+galErr(fail),true);return;
      }
      galApply(r.path,!!r.overwritten);
      stamp(r.same?'photo already there, using '+r.path:(r.overwritten?'photo overwritten: ':'photo copied: ')+r.path);
    }
    function galAsk(src,taken,free,up){
      GL.ask={src:src,taken:taken,up:up||null};
      GL.q.innerHTML=
        '<p><b>immagini/'+esc(taken)+'</b> already exists with a different photo.</p>'+
        '<div class="row"><input class="num" id="galn" type="text" value="'+esc(free)+'" aria-label="New name"'+
        ' autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">'+
        '<button class="btn go" type="button" data-a="as">Save with this name</button></div>'+
        '<div class="row"><button class="btn" type="button" data-a="over">Overwrite '+esc(taken)+'</button>'+
        '<button class="btn" type="button" data-a="no">Cancel</button></div>'+
        '<p class="hint">Devices that already loaded the old photo may keep showing it for up to a month (cache).</p>';
      GL.q.hidden=false;
      galMsg('');
    }
    function galAnswer(a){
      const k=GL.ask;if(!k||GL.busy)return;
      if(a==='no'){galAskClose();return;}
      if(a==='over'){k.up?upFinish(k.up,k.taken,true):galCopy(k.src,k.taken,true);return;}
      const n=GL.q.querySelector('#galn'),v=n?n.value.trim():'';
      if(!/^[A-Za-z0-9._-]+$/.test(v)||v[0]==='.'){galMsg('invalid name: A-Z, a-z, 0-9, ., - and _ only',true);return;}
      k.up?upFinish(k.up,v,false):galCopy(k.src,v,false);
    }
    function galAskClose(){
      const k=GL.ask;GL.ask=null;GL.q.hidden=true;
      if(k&&k.up){upCancel(k.up);if(GL.up&&GL.up.id===k.up)GL.up=null;galMsg('upload cancelled');}
    }

    const UP_EXT=['.jpg','.jpeg','.png','.webp','.gif','.avif'],UP_MAX=40*1048576,UP_PIECE=512*1024;
    function b64(blob){
      return new Promise((res,rej)=>{
        const r=new FileReader();
        r.onload=()=>{const t=String(r.result);res(t.slice(t.indexOf(',')+1));};
        r.onerror=()=>rej(r.error||new Error('file read failed'));
        r.readAsDataURL(blob);
      });
    }
    function upCancel(id){if(id)wsCall({type:'ada_studio/upload_cancel',id_upload:id}).catch(()=>{});}
    function upEnd(){GL.busy=false;GL.el.classList.remove('busy');}
    async function galUpload(file){
      if(!file||GL.busy||!proj)return;
      const nm=file.name||'photo.jpg',ext=(nm.match(/\.[^.]+$/)||[''])[0].toLowerCase();
      if(ext==='.heic'||ext==='.heif'){galMsg('HEIC not supported: convert to JPEG',true);return;}
      if(UP_EXT.indexOf(ext)<0){galMsg('unsupported format: use JPEG, PNG, WebP, GIF or AVIF',true);return;}
      if(file.size>UP_MAX){galMsg('photo too large: max 40 MB',true);return;}
      if(!file.size){galMsg('file is empty',true);return;}
      const seq=GL.seq;
      GL.q.hidden=true;GL.ask=null;
      GL.busy=true;GL.el.classList.add('busy');galMsg('uploading…');
      let up;
      try{
        const r=await wsCall({type:'ada_studio/upload_begin',project:proj,name:nm,size:file.size});
        up=GL.up={id:r.id,abort:false};
        const piece=Math.min(r.chunk||UP_PIECE,UP_PIECE);
        for(let off=0;off<file.size;off+=piece){
          if(up.abort||seq!==GL.seq)return;
          const data=await b64(file.slice(off,Math.min(file.size,off+piece)));
          if(up.abort||seq!==GL.seq)return;
          await wsCall({type:'ada_studio/upload_chunk',id_upload:up.id,offset:off,data:data});
          const done=Math.min(file.size,off+piece);
          galMsg('uploading '+Math.round(done*100/file.size)+'% ('+kb(done)+' of '+kb(file.size)+')');
        }
      }catch(err){
        if(up){upCancel(up.id);if(GL.up===up)GL.up=null;}
        upEnd();
        if(seq===GL.seq)galMsg('upload failed: '+galErr(err),true);
        return;
      }
      upEnd();
      if(up.abort||seq!==GL.seq)return;
      upFinish(up.id,null,false);
    }
    async function upFinish(id,as,over){
      const seq=GL.seq;
      GL.busy=true;GL.el.classList.add('busy');GL.q.hidden=true;
      galMsg(over?'overwriting…':'saving to project…');
      let r=null,fail=null;
      try{r=await wsCall({type:'ada_studio/upload_finish',id_upload:id,as:as||null,overwrite:!!over});}
      catch(err){fail=err;}
      upEnd();
      if(seq!==GL.seq)return;
      if(fail){
        if(fail.code==='name_taken'){
          const m=String(fail.message||'').split('|');
          galAsk('',m[1]||as||'',m[0]||'',id);return;
        }
        upCancel(id);if(GL.up&&GL.up.id===id)GL.up=null;
        galMsg('upload failed: '+galErr(fail),true);return;
      }
      if(GL.up&&GL.up.id===id)GL.up=null;
      galApply(r.path,!!r.overwritten);
      stamp(r.same?'photo already there, using '+r.path:(r.overwritten?'photo overwritten: ':'photo uploaded: ')+r.path);
    }
    $('#galup').addEventListener('click',()=>{if(!GL.busy)$('#galf').click();});
    $('#galf').addEventListener('change',e=>{
      const f=e.target.files&&e.target.files[0];
      e.target.value='';
      galUpload(f);
    });
    function galApply(path,over){
      settle();
      const u=full(path);
      if(over){
        bust.set(u,Date.now());dims.delete(u);
        try{fetch(u,{cache:'reload',credentials:'same-origin'}).catch(()=>{});}catch(_){}
      }
      probes.delete(path);
      if(galBl()){const b=bgOf(GL.target.blId);if(b)b.p=path;}
      else if(galSt()){
        if(galStP()){const p=stEdit(GL.target.stId).st.n;p.ip=path;delete p.iw;delete p.ih;}
      }
      else if(GL.target&&S.objects.indexOf(phZone(GL.target))>=0){
        IMW(GL.target).p=path;
        const z=phZone(GL.target),n=E.insp.querySelector('input[data-ki="p"]');
        if(n&&sel>=0&&S.objects[sel]===z&&IM(curPh(z))===IM(GL.target))n.value=path;
      }
      galClose();
      render();insRefresh();store(true);
    }
    GL.g.addEventListener('click',e=>{
      if(GL.busy)return;
      const up=e.target.closest('[data-up]');
      if(up){galLoad(GL.root,up.dataset.up);return;}
      const d=e.target.closest('[data-d]');
      if(d){const en=GL.shown[+d.dataset.d];if(en)galLoad(GL.root,(GL.path?GL.path+'/':'')+en.name);return;}
      const t=e.target.closest('[data-f]');if(!t)return;
      const en=GL.shown[+t.dataset.f];if(!en)return;
      if(GL.root==='project')galApply(en.name,false);
      else galCopy(en.name,null,false);
    });
    GL.p.addEventListener('click',e=>{const b=e.target.closest('[data-up]');if(b&&!GL.busy)galLoad(GL.root,b.dataset.up);});
    GL.r.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(b&&!GL.busy&&b.dataset.r!==GL.root)galLoad(b.dataset.r);});
    GL.q.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)galAnswer(b.dataset.a);});
    GL.q.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='galn'){e.preventDefault();galAnswer('as');}});
    GL.s.addEventListener('input',()=>galGrid());
    $('#galx').addEventListener('click',galClose);
    GL.el.addEventListener('click',e=>{if(e.target===GL.el&&!GL.busy)galClose();});
    GL.el.addEventListener('keydown',e=>{
      if(e.key!=='Escape')return;
      e.preventDefault();
      if(GL.ask)galAskClose();else if(!GL.busy||GL.up)galClose();
    });

    function onHass(){
      self._hass=spHass(self._hraw);
      const h=self._hass;if(!h||!h.states)return;
      cdHass(h);
      chrome();
      if(!booted)boot();
      const cur=CAUS().map(k=>k.e?h.states[k.e]:undefined);
      let ch=cur.length!==lastSt.length;
      for(let i=0;!ch&&i<cur.length;i++)if(cur[i]!==lastSt[i])ch=true;
      if(!ch)return;
      lastSt=cur;
      req();
      giro(()=>{
        insRefresh();bhPanel();
        if(selRu){put(E.list,ruRows());ruPanel();}
        if(selTe&&!selSt&&!selRu){put(E.list,teRows());tePanel();}
        if(flow)flCols();
      });
    }

    (function(){
      const grip=$('#grip'),list=E.list,det=$('#detail'),dsp=$('#dsp');
      let lh=180;
      try{const h=+localStorage.getItem(KEY+'-listh');if(h>=60)lh=h;}catch(_){}
      list.style.height=lh+'px';
      let shr=-1;
      const fold=()=>{
        const inAside=det.parentNode===grip.parentNode;
        const cur=inAside?list.querySelector(':scope>.on'):null,min=cur?Math.max(34,cur.offsetHeight+10):34;
        const s=inAside&&lh>min?Math.max(0,Math.min(lh-min,det.scrollTop)):0;
        if(s===shr)return;
        shr=s;
        list.style.height=(lh-s)+'px';
        dsp.style.height=s?s+'px':'';
        if(s&&cur){const a=cur.offsetTop-list.scrollTop,b=a+cur.offsetHeight;
          if(a<0||b>list.clientHeight)list.scrollTop=cur.offsetTop-Math.max(0,(list.clientHeight-cur.offsetHeight)/2);}
      };
      det.addEventListener('scroll',fold,{passive:true});
      list.fold=fold;
      let gy=null,gh=0;
      grip.addEventListener('pointerdown',e=>{
        if(shr>0){det.scrollTop=0;fold();}
        gy=e.clientY;gh=list.offsetHeight;grip.classList.add('on');grip.setPointerCapture(e.pointerId);e.preventDefault();});
      grip.addEventListener('pointermove',e=>{
        if(gy===null)return;
        const aside=grip.parentNode,max=Math.max(80,aside.clientHeight-160);
        lh=Math.max(60,Math.min(max,gh+e.clientY-gy));list.style.height=lh+'px';
      });
      const end=()=>{if(gy===null)return;gy=null;grip.classList.remove('on');
        try{localStorage.setItem(KEY+'-listh',lh);}catch(_){}};
      grip.addEventListener('pointerup',end);grip.addEventListener('pointercancel',end);
    })();

    function guideMove(e){
      const g=S.guides[gdrag.i];if(!g)return;
      if(!gdrag.live){
        if(Math.abs(e.clientX-gdrag.sx)+Math.abs(e.clientY-gdrag.sy)<(coarse?8:4))return;
        gdrag.live=true;
      }
      const p=pt(e);let v=g.v?p.x:p.y;
      unsnap();
      if(!e.altKey){
        let bd=8/zoom,hit=null;
        if(E.sv.checked)for(const a of gdrag.anc){const dd=Math.abs((g.v?a.x:a.y)-v);if(dd<bd){bd=dd;hit=a;}}
        if(hit){v=g.v?hit.x:hit.y;snapped={x:hit.x,y:hit.y,k:'v'};}
        else if(E.sg.checked)v=Math.round(v/S.grid)*S.grid;
      }
      moveGuide(g,v);v=g.c;
      stamp('guide '+(g.v?'x':'y')+' = '+v);
      req();
    }
    function guideEnd(e){
      const d=gdrag;gdrag=null;unsnap();
      const g=S.guides[d.i];
      if(g&&d.live){
        const r=stage.getBoundingClientRect();
        const out=g.v?(e.clientX<r.left||g.c<0||g.c>S.w):(e.clientY<r.top||g.c<0||g.c>S.h);
        if(out){moveGuide(g,d.c0);S.guides.splice(d.i,1);selG=-1;}
      }
      render();store(true);stamp();
    }
    function markerAt(v,e){
      const cr=cv.getBoundingClientRect(),m=v?0:1;
      let bi=-1,bd=coarse?14:9;
      (S.guides||[]).forEach((g,i)=>{
        if(g.v!==m)return;
        const pos=m?cr.left+g.c*zoom:cr.top+g.c*zoom,dd=Math.abs((m?e.clientX:e.clientY)-pos);
        if(dd<=bd){bd=dd;bi=i;}
      });
      return bi;
    }
    function rulerDown(v){
      return e=>{
        if(glock||flow)return;
        if(e.pointerType==='mouse'&&e.button!==0)return;
        e.preventDefault();settle();
        if(E.gdon.checked){
          const bi=markerAt(v,e);
          if(bi>=0){
            selG=bi;pick([]);selBg=selSt=selRu=selTe=false;
            const G=S.guides[bi];
            gdrag={i:bi,sx:e.clientX,sy:e.clientY,live:false,c0:G.c,anc:anchorsEx(gLinked(G,true))};
            e.currentTarget.setPointerCapture(e.pointerId);render();return;
          }
        }
        if(!E.gdon.checked)E.gdon.checked=true;
        const p=pt(e);
        S.guides.push({v:v,c:iv(v?p.x:p.y),id:gNewId()});
        selG=S.guides.length-1;pick([]);selBg=selSt=selRu=selTe=false;
        gdrag={i:selG,sx:e.clientX,sy:e.clientY,live:true,c0:S.guides[selG].c,anc:anchors(-1)};
        e.currentTarget.setPointerCapture(e.pointerId);
        render();
      };
    }
    [[E.rtop,0],[E.rleft,1]].forEach(([el,v])=>{
      el.addEventListener('pointerdown',rulerDown(v));
      el.addEventListener('pointermove',e=>{if(gdrag)guideMove(e);});
      const up=e=>{if(gdrag)guideEnd(e);};
      el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
      el.addEventListener('dblclick',e=>{
        if(glock||flow||!E.gdon.checked)return;
        const i=markerAt(v,e);
        if(i>=0&&i===selG){E.gpos.focus();E.gpos.select();}
      });
    });
    E.gdon.addEventListener('change',()=>{unsnap();render();});
    function lockUI(){
      E.rcorner.setAttribute('aria-pressed',glock);
      E.rcorner.title=glock?'Unlock guides':'Lock guides';
      E.lockp.setAttribute('d',glock?'M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z':'M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z');
      E.rtop.classList.toggle('off',glock);E.rleft.classList.toggle('off',glock);
    }
    try{glock=localStorage.getItem(KEY+'-glock')==='1';}catch(_){}
    lockUI();
    E.rcorner.addEventListener('click',()=>{
      glock=!glock;lockUI();render();
      try{localStorage.setItem(KEY+'-glock',glock?'1':'0');}catch(_){}
    });
    E.gpos.addEventListener('input',e=>{
      const g=S.guides[selG];if(!g)return;
      const v=parseFloat(e.target.value);if(isNaN(v))return;
      moveGuide(g,v);render();store();
    });
    $('#gdet').addEventListener('click',()=>{
      const g=S.guides[selG];if(!g)return;
      settle();gLinkedG(g).concat(gLinkedS(g)).forEach(o=>{delete o.gl[gAxis(g)];if(!Object.keys(o.gl).length)delete o.gl;});
      render();store(true);
    });
    $('#gdel').addEventListener('click',()=>{
      if(!S.guides[selG])return;
      settle();S.guides.splice(selG,1);selG=-1;render();store(true);
    });

    let rRaf=0,rKey='';
    function rulersReq(){if(!rRaf)rRaf=requestAnimationFrame(()=>{rRaf=0;rulers();});}
    function rulers(){
      const cr=cv.getBoundingClientRect(),ta=E.rtop.getBoundingClientRect(),la=E.rleft.getBoundingClientRect();
      const cs=getComputedStyle(self),dpr=window.devicePixelRatio||1;
      const col={ink:cs.getPropertyValue('--ink2').trim()||'#5c6472',band:cs.getPropertyValue('--chrome').trim()||'#fff',
                 guide:cs.getPropertyValue('--guide').trim()||'#00A3E0',font:cs.fontFamily||'sans-serif'};
      const key=[cr.left,cr.top,ta.left,ta.width,ta.height,la.top,la.width,la.height,zoom,S.w,S.h,dpr,
                 JSON.stringify(S.guides||[]),selG,gOn(),col.ink,col.band].join('|');
      if(key===rKey)return;rKey=key;
      const GS=gOn()?(S.guides||[]):[];
      const mk=v=>GS.map((g,i)=>({c:g.c,on:i===selG,v:g.v})).filter(g=>g.v===v);
      one(E.rtop.firstElementChild,ta.width,ta.height,cr.left-ta.left,true,S.w,mk(1),col,dpr);
      one(E.rleft.firstElementChild,la.width,la.height,cr.top-la.top,false,S.h,mk(0),col,dpr);
    }
    function one(cvs,W,H,o,hor,ext,marks,col,dpr){
      if(!cvs||!W||!H)return;
      const cw=Math.round(W*dpr),chh=Math.round(H*dpr);
      if(cvs.width!==cw)cvs.width=cw;
      if(cvs.height!==chh)cvs.height=chh;
      const c=cvs.getContext&&cvs.getContext('2d');if(!c)return;
      c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
      const L=hor?W:H,T=hor?H:W;
      c.fillStyle=col.band;
      if(hor)c.fillRect(o,0,ext*zoom,H);else c.fillRect(0,o,W,ext*zoom);
      const steps=[1,2,5,10,20,50,100,200,500,1000,2000,5000,10000];
      const maj=steps.find(s=>s*zoom>=60)||10000;
      const mn=maj/10*zoom>=6?maj/10:maj/5;
      const u0=Math.floor(-o/zoom/mn)*mn,u1=(L-o)/zoom;
      c.strokeStyle=col.ink;c.fillStyle=col.ink;c.lineWidth=1;c.font='10px '+col.font;
      c.beginPath();
      for(let k=0,u=u0;u<=u1&&k<2000;k++,u=u0+k*mn){
        const pos=Math.round(o+u*zoom)+.5,isM=Math.abs(u/maj-Math.round(u/maj))<1e-6,len=isM?T:T*.3;
        if(hor){c.moveTo(pos,T);c.lineTo(pos,T-len);}else{c.moveTo(T,pos);c.lineTo(T-len,pos);}
        if(isM){
          const t=String(Math.round(u*100)/100);
          if(hor){c.textAlign='left';c.fillText(t,pos+3,9);}
          else{c.save();c.translate(9,pos+3);c.rotate(-Math.PI/2);c.textAlign='right';c.fillText(t,0,0);c.restore();}
        }
      }
      c.stroke();
      marks.forEach(m=>{
        const pos=o+m.c*zoom;
        c.beginPath();
        if(hor){c.moveTo(pos-8,T-12);c.lineTo(pos+8,T-12);c.lineTo(pos,T);}
        else{c.moveTo(T-12,pos-8);c.lineTo(T-12,pos+8);c.lineTo(T,pos);}
        c.closePath();
        c.fillStyle=col.guide;c.fill();
        if(m.on){c.lineWidth=1.5;c.strokeStyle=col.ink;c.stroke();}
      });
    }
    stage.addEventListener('scroll',rulersReq,{passive:true});
    if(window.ResizeObserver)new ResizeObserver(rulersReq).observe(stage);

    (function(){
      const grip=$('#wgrip'),main=$('main'),aside=$('aside');
      const setW=w=>main.style.setProperty('--aside-w',w+'px');
      try{const w=+localStorage.getItem(KEY+'-asidew');if(w>=240)setW(Math.min(1200,w));}catch(_){}
      let gx=null,gw=0;
      grip.addEventListener('pointerdown',e=>{gx=e.clientX;gw=aside.offsetWidth;grip.classList.add('on');grip.setPointerCapture(e.pointerId);e.preventDefault();});
      grip.addEventListener('pointermove',e=>{
        if(gx===null)return;
        const max=Math.max(240,main.clientWidth-240);
        setW(Math.round(Math.max(240,Math.min(max,gw-(e.clientX-gx)))));
      });
      const end=()=>{if(gx===null)return;gx=null;grip.classList.remove('on');
        try{localStorage.setItem(KEY+'-asidew',aside.offsetWidth);}catch(_){}};
      grip.addEventListener('pointerup',end);grip.addEventListener('pointercancel',end);
      grip.addEventListener('dblclick',()=>{main.style.removeProperty('--aside-w');
        try{localStorage.removeItem(KEY+'-asidew');}catch(_){}});
    })();

    try{opening=!!localStorage.getItem(KEY+'-last');}catch(_){}
    if(!opening){
      const p=bozza('');if(p)S=Object.assign(fresh(),p);
    }
    
    chrome();
    fields();
    start();
    requestAnimationFrame(()=>{fit();snap(true);stamp(opening?'opening project…':'');onHass();});

    this._api={hass:onHass,chrome:chrome,start:()=>{start();chrome();},stop:stop};
  }
}

if(!customElements.get('ada-studio')) customElements.define('ada-studio', AdaStudio);
