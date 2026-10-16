// This source is the entire nonce-authorized program. Generated content is only
// ever delivered as data over the private port, never interpolated into it.
export const HTML_PREVIEW_RUNTIME = String.raw`
(() => {
  'use strict';
  if(typeof CSSStyleSheet==='undefined' || typeof CSSStyleSheet.prototype.replaceSync!=='function' || typeof ResizeObserver==='undefined')return;
  const bootstrap = document.currentScript;
  const channel = bootstrap.dataset.channel;
  const parentOrigin = bootstrap.dataset.parentOrigin;
  const MAX_HTML = 1048576;
  const MAX_ASSETS = 96;
  const MAX_BYTES = 33554432;
  const WIDTH = 1040;
  // The host redirects at most 2600ms after completion; the 1150ms sheen must start in time.
  const SETTLE_BUDGET = 1250;
  const DECODE_TIMEOUT = 3000;
  const MAX_BACKGROUND_REVEALS = 6;
  const pages = new Map();
  const resources = new Map();
  const pending = new Map();
  const motions = new Set();
  const hidden = new Set();
  const completions = new Set();
  const timers = new Set();
  const reveals = new Set();
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let port = null, active = false, generating = false, complete = false;
  let version = 0, bytes = 0, frame = 0, disposed = false;
  let waitingText = '', imageErrorText = '';
  let homeReady = false;
  let completeAt = null;
  // Set by a capacity rejection; until something is evicted, document updates prune too.
  let pressure = false;
  const viewport = document.createElement('div');
  viewport.className = 'preview-viewport';
  viewport.tabIndex = 0;
  const scene = document.createElement('div');
  scene.className = 'preview-scene';
  const flightLayer = document.createElement('div');
  flightLayer.className = 'preview-flights';
  flightLayer.setAttribute('aria-hidden', 'true');
  const waiting = document.createElement('p');
  waiting.className = 'preview-waiting';
  scene.append(waiting, flightLayer);
  viewport.append(scene);
  document.body.replaceChildren(viewport);
  const style = document.createElement('style');
  style.textContent = [
    'html,body{margin:0;width:100%;height:100%;overflow:hidden;color-scheme:light;font:13px/1.5 system-ui,sans-serif}',
    '*{box-sizing:border-box}[hidden]{display:none!important}',
    '.preview-viewport{width:100%;height:100%;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,CanvasText 25%,transparent) transparent}',
    '.preview-viewport:focus-visible{outline:2px solid Highlight;outline-offset:-2px}',
    '.preview-scene{position:relative;width:100%;min-height:100%;overflow:hidden}',
    '.preview-page{position:absolute;left:0;top:0;width:1040px;transform-origin:0 0}',
    '.preview-surface{position:relative;width:1040px;isolation:isolate;background:Canvas;box-shadow:0 1px 4px color-mix(in srgb,CanvasText 10%,transparent)}',
    '.preview-host{display:block;container-type:inline-size;width:1040px}',
    '.preview-title{position:absolute;font:12px/18px system-ui,sans-serif;color:GrayText;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.preview-waiting{position:absolute;inset:35% 20% auto;text-align:center;color:GrayText;font-size:13px}',
    '.preview-flights{position:absolute;inset:0;pointer-events:none;z-index:5}',
    '.preview-flight{position:absolute;left:0;top:0;overflow:hidden;transform-origin:0 0;pointer-events:none;background:Canvas;box-shadow:0 18px 48px color-mix(in srgb,CanvasText 13%,transparent)}',
    '.preview-crop{position:absolute;left:0;top:0;width:1040px;container-type:inline-size}',
    '.preview-slot{position:absolute;pointer-events:none;border:1px dashed color-mix(in srgb,CanvasText 20%,transparent);background:color-mix(in srgb,Canvas 25%,transparent);z-index:3}',
    '.preview-tail{display:flex;flex-direction:column;gap:20px;padding:24px 36px 28px;pointer-events:none;mask-image:linear-gradient(CanvasText 35%,transparent);transition:opacity 250ms ease}',
    '.preview-tail.arriving{opacity:.3}.preview-tail.arriving .preview-fragment{animation-play-state:paused}',
    '.preview-fragment{height:var(--height);display:grid;gap:10px;grid-template-columns:1fr 1fr;animation:preview-breathe 2.5s ease-in-out infinite;animation-delay:var(--delay)}',
    '.preview-fragment span{display:block;background:color-mix(in srgb,CanvasText 9%,transparent);border-radius:2px}',
    '.preview-fragment .heading{height:20px;width:55%}.preview-fragment .line{height:10px;width:80%}.preview-fragment .short{width:55%}.preview-fragment .media{min-height:0}',
    '.preview-fragment[data-kind=editorial]{grid-template-columns:1fr}.preview-fragment[data-kind=editorial] .media{display:none}',
    '.preview-fragment[data-kind=split-left] .media{grid-column:1;grid-row:1/4}.preview-fragment[data-kind=split-left] span:not(.media){grid-column:2}',
    '.preview-fragment[data-kind=split-right] .media{grid-column:2;grid-row:1/4}.preview-fragment[data-kind=split-right] span:not(.media){grid-column:1}',
    '.preview-fragment[data-kind=image]{grid-template-columns:1fr}.preview-fragment[data-kind=image] span:not(.media){display:none}',
    '.preview-fragment[data-kind=quote]{display:flex;flex-direction:column;justify-content:center;align-items:center}.preview-fragment[data-kind=quote] .media{display:none}.preview-fragment[data-kind=quote] .heading{width:70%;height:30px}',
    '.preview-fragment[data-kind=columns]{grid-template-columns:repeat(3,1fr)}.preview-fragment[data-kind=columns]>span{display:none}',
    '.preview-cell{display:none;grid-template-rows:1fr 10px 10px;gap:10px}.preview-fragment[data-kind=columns] .preview-cell{display:grid}',
    '.completion-gloss{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:6}',
    '.completion-sheen{position:absolute;inset-block:0;left:0;width:300%;background:linear-gradient(112deg,transparent 43%,color-mix(in srgb,Canvas 28%,transparent) 47%,color-mix(in srgb,Canvas 60%,transparent) 50%,transparent 57%);animation:preview-sheen 1150ms cubic-bezier(.45,0,.25,1) 1 forwards}',
    '.is-polished{animation:preview-lift 1400ms ease-in-out 1}.is-polished:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:4;box-shadow:0 0 0 2px color-mix(in srgb,Highlight 22%,transparent);animation:preview-halo 1400ms ease-out 1}',
    '@keyframes preview-breathe{0%,100%{opacity:.5}50%{opacity:1}}',
    '@keyframes preview-sheen{0%{transform:translateX(-66.667%);opacity:0}12%,85%{opacity:1}100%{transform:translateX(0);opacity:0}}',
    '@keyframes preview-lift{0%,100%{filter:brightness(1)}45%{filter:brightness(1.04)}}',
    '@keyframes preview-halo{0%,100%{opacity:0}40%{opacity:1}}',
    '@media(prefers-reduced-motion:reduce){*,*:after{animation:none!important;transition:none!important}.completion-sheen{display:none}.is-polished{outline:2px solid color-mix(in srgb,Highlight 30%,transparent)}}'
  ].join('\n');
  document.head.append(style);

  function send(type, data) {
    if (port && !disposed) port.postMessage(Object.assign({ v:1, channel:channel, type:type }, data));
  }
  function later(callback, delay) {
    const timer = setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
    return timer;
  }
  function cancelMotion() {
    version++;
    motions.forEach(animation => animation.cancel()); motions.clear();
    hidden.forEach(node => { node.style.visibility = ''; }); hidden.clear();
    flightLayer.replaceChildren();
    completions.forEach(cleanup => cleanup()); completions.clear();
    timers.forEach(timer => clearTimeout(timer)); timers.clear();
    pages.forEach(page => { page.tail.classList.remove('arriving'); page.polishing=false; page.fadeTimer=null; });
  }
  function cancelReveals() { reveals.forEach(animation => animation.cancel()); reveals.clear(); }
  function run(element, frames, options) {
    const animation = element.animate(frames, options);
    motions.add(animation);
    return animation.finished.catch(() => {}).then(() => { motions.delete(animation); });
  }
  function emitStatus() {
    const home = pages.get('/');
    const ready = !!(home && home.meaningful);
    if (homeReady !== ready) { homeReady = ready; send('status', { homeReady:ready }); }
  }
  function resourceUrl(id) { const asset=resources.get(id); return asset && asset.ready ? asset.url : ''; }
  function rewriteUrls(value) {
    return value.replace(/preview-asset:([a-f0-9]{64})/g, (_match, id) => resourceUrl(id));
  }
  function scopedCss(value, fontRules, familyNames) {
    try {
      const sheet = new CSSStyleSheet(); sheet.replaceSync(value);
      function collect(rules) {
        Array.from(rules).forEach(rule => {
          if (rule.type===5) {
            const family=rule.style.getPropertyValue('font-family').trim().replace(/^['"]|['"]$/g,'');
            if (/^[a-zA-Z0-9 _-]{1,80}$/.test(family) && !familyNames.has(family.toLowerCase())) familyNames.set(family.toLowerCase(),'preview-'+familyNames.prefix+'-'+familyNames.size);
          } else if(rule.cssRules) collect(rule.cssRules);
        });
      }
      collect(sheet.cssRules);
      function declaration(style) {
        const copy=document.createElement('span').style;copy.cssText=style.cssText;
        Array.from(copy).forEach(property=>{
          if(property!=='font' && property!=='font-family' && !property.startsWith('--'))return;
          let text=copy.getPropertyValue(property);
          familyNames.forEach((replacement,name)=>{text=text.replace(new RegExp('(^|[^a-zA-Z0-9_-])'+name+'(?=$|[^a-zA-Z0-9_-])','gi'),(_match,before)=>before+replacement);});
          copy.setProperty(property,text,copy.getPropertyPriority(property));
        });
        return copy.cssText;
      }
      function serialize(rules) {
        return Array.from(rules).map(rule => {
          if(rule.type===5){const family=rule.style.getPropertyValue('font-family').trim().replace(/^['"]|['"]$/g,'').toLowerCase();if(familyNames.has(family)){rule.style.setProperty('font-family',familyNames.get(family));fontRules.push(rule.cssText);}return '';}
          if(rule.type===1){const selectors=rule.selectorText.replace(/:root\b/g,'html').replace(/:host(?:-context)?(?:\([^)]*\))?/g,':not(*)');return selectors+'{'+declaration(rule.style)+'}';}
          if(rule.type===4){const query=rule.conditionText.replace(/^(?:only\s+)?(?:screen|all)\s+and\s+/i,'');const widthOnly=/width/i.test(query)&&!/height|orientation|prefers|hover|pointer|print|,/i.test(query);return(widthOnly?'@container ':'@media ')+query+'{'+serialize(rule.cssRules)+'}';}
          if(rule.type===7){return '@keyframes '+rule.name+'{'+Array.from(rule.cssRules).map(key=>key.keyText+'{'+declaration(key.style)+'}').join('')+'}';}
          if(rule.cssRules){const header=rule.cssText.slice(0,rule.cssText.indexOf('{')).trim();if(/^@(supports|container|layer)\b/i.test(header))return header+'{'+serialize(rule.cssRules)+'}';return '';}
          if(/^@layer\s+[a-zA-Z0-9_. ,\-]+;$/.test(rule.cssText))return rule.cssText;
          return '';
        }).join('\n');
      }
      return serialize(sheet.cssRules);
    }catch(_){return '';}
  }
  const imageStyle = 'img[data-preview-image]{opacity:0!important;transition:opacity 720ms cubic-bezier(.4,0,.2,1)!important}img[data-preview-loaded]{opacity:1!important}@media(prefers-reduced-motion:reduce){img[data-preview-image]{transition:none!important}*,*:before,*:after{animation:none!important}}';
  function parse(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    parsed.querySelectorAll('script,iframe,object,embed,form,input,button,select,textarea,link,meta,base,svg,math,template,noscript').forEach(node => node.remove());
    parsed.querySelectorAll('*').forEach(node => {
      Array.from(node.attributes).forEach(attribute => {
        if (/^on/i.test(attribute.name) || /^(?:nonce|href|src|srcdoc|srcset|action|formaction|ping|autofocus|contenteditable)$/i.test(attribute.name)) node.removeAttribute(attribute.name);
      });
    });
    return parsed.documentElement;
  }
  function anchors(root) {
    const mains = root.querySelectorAll('main.site');
    if (mains.length !== 1) return null;
    const main = mains[0];
    const sections = Array.from(main.querySelectorAll('section')).filter(node => {
      let ancestor = node.parentElement;
      while (ancestor && ancestor !== main) { if (ancestor.tagName === 'SECTION') return false; ancestor = ancestor.parentElement; }
      return true;
    });
    if (!sections.length) return null;
    const counts = new Map();
    root.querySelectorAll('[id]').forEach(node => counts.set(node.id, (counts.get(node.id) || 0) + 1));
    if (sections.some(node => !/^[a-zA-Z][\w-]{0,127}$/.test(node.id) || counts.get(node.id) !== 1)) return null;
    return sections;
  }
  function meaningful(root) {
    const body = root.querySelector('body');
    if (!body) return false;
    const copy = body.cloneNode(true);
    copy.querySelectorAll('header,nav,footer,style').forEach(node => node.remove());
    return !!copy.querySelector('h1,h2') && copy.textContent.trim().length >= 30 && !!copy.querySelector('p,section,img[data-preview-image]');
  }
  function nodeKey(node,keyed) {
    if (!node || node.nodeType!==1) return '';
    if(node.tagName==='MAIN' && node.classList.contains('site')) return '@main.site';
    return keyed.has(node.id)?node.id:'';
  }
  function morph(old, next, keyed) {
    const isImage = old.nodeType === 1 && old.tagName === 'IMG';
    if (old.nodeType === 3) { if (old.textContent !== next.textContent) old.textContent = next.textContent; return; }
    if (old.nodeType !== 1) return;
    const sameImage = isImage && old.getAttribute('data-preview-image') === next.getAttribute('data-preview-image');
    Array.from(old.attributes).forEach(attribute => {
      if (sameImage && /^(?:src|data-preview-loaded|data-preview-observed|data-preview-error)$/.test(attribute.name)) return;
      if (!next.hasAttribute(attribute.name)) old.removeAttribute(attribute.name);
    });
    Array.from(next.attributes).forEach(attribute => {
      if (old.getAttribute(attribute.name) !== attribute.value) old.setAttribute(attribute.name, attribute.value);
    });
    if (isImage && !sameImage) { old.removeAttribute('data-preview-loaded'); old.removeAttribute('data-preview-observed'); old.removeAttribute('data-preview-error'); }
    Array.from(next.childNodes).forEach((child, index) => {
      let current = old.childNodes[index];
      const key = nodeKey(child,keyed);
      if(!key && nodeKey(current,keyed)) { old.insertBefore(child.cloneNode(true),current); current=old.childNodes[index]; }
      if (key && nodeKey(current,keyed)!==key) {
        const existing = Array.from(old.childNodes).find(node => nodeKey(node,keyed)===key);
        const replacement = existing || child.cloneNode(true);
        old.insertBefore(replacement, current || null); current = replacement;
      }
      if (!current) old.append(child.cloneNode(true));
      else if (current.nodeType !== child.nodeType || current.nodeName !== child.nodeName) current.replaceWith(child.cloneNode(true));
      else morph(current, child, keyed);
    });
    while (old.childNodes.length > next.childNodes.length) old.lastChild.remove();
  }
  const variants = ['editorial','split-left','split-right','columns','image','quote'];
  const usedPairs = new Set();
  function loadingTail() {
    const tail = document.createElement('div'); tail.className = 'preview-tail'; tail.setAttribute('aria-hidden','true');
    const shuffled = variants.slice().sort(() => Math.random() - .5);
    let pair = shuffled.slice(0,2);
    for (let index=1; index<shuffled.length; index++) {
      const candidate = [shuffled[0],shuffled[index]];
      if (!usedPairs.has(candidate.slice().sort().join('|'))) { pair = candidate; break; }
    }
    usedPairs.add(pair.slice().sort().join('|'));
    pair.forEach((kind, index) => {
      const fragment = document.createElement('div'); fragment.className = 'preview-fragment'; fragment.dataset.kind = kind;
      fragment.style.setProperty('--height', (110 + Math.floor(Math.random()*45)) + 'px');
      fragment.style.setProperty('--delay', (-Math.random()*1.5-index*.4) + 's');
      ['heading','line','line short','media'].forEach(name => { const span = document.createElement('span'); span.className = name; fragment.append(span); });
      for (let column=0; column<3; column++) {
        const cell = document.createElement('div'); cell.className = 'preview-cell';
        ['media','line','line short'].forEach(name => { const span=document.createElement('span'); span.className=name; cell.append(span); });
        fragment.append(cell);
      }
      tail.append(fragment);
    });
    return tail;
  }
  function makePage(route, title, epoch) {
    const position = document.createElement('div'); position.className = 'preview-page';
    const surface = document.createElement('div'); surface.className = 'preview-surface';
    const host = document.createElement('div'); host.className = 'preview-host';
    const shadow = host.attachShadow({mode:'closed'});
    const tail = loadingTail();
    surface.append(host, tail); position.append(surface); scene.insertBefore(position, flightLayer);
    const label = document.createElement('div'); label.className = 'preview-title'; label.textContent = title;
    if (route !== '/') scene.insertBefore(label, flightLayer);
    const fonts = document.createElement('style'); document.head.append(fonts);
    const familyNames=new Map();familyNames.prefix=String(pages.size)+'-'+Math.random().toString(36).slice(2,10);
    const page = {familyNames:familyNames,route:route,title:title,epoch:epoch,position:position,surface:surface,host:host,shadow:shadow,tail:tail,label:label,fonts:fonts,root:null,html:'',ids:null,meaningful:false,height:0,scale:1,x:0,y:0,polished:false,fadeUntil:0};
    page.observer = new ResizeObserver(() => {
      if (!page.root || !active) return;
      const height = Math.max(page.root.offsetHeight,page.root.scrollHeight);
      if (Math.abs(height-page.height)>1) reframe();
    });
    pages.set(route,page); return page;
  }
  function applyResources(page) {
    if (!page.root) return;
    const fontRules = [];
    page.root.querySelectorAll('style:not([data-preview-internal])').forEach(node => {
      if (node.textContent !== node._previewRendered) node._previewSource = node.textContent;
      const css = scopedCss(rewriteUrls(node._previewSource || ''), fontRules, page.familyNames);
      if (node.textContent !== css) node.textContent = css;
      node._previewRendered = css;
    });
    const fonts = fontRules.join('\n'); if (page.fonts.textContent !== fonts) page.fonts.textContent = fonts;
    page.root.querySelectorAll('[style]').forEach(node => {
      const value = node.getAttribute('style');
      if (value !== node._previewInlineRendered) node._previewInlineSource = value;
      let rewritten = rewriteUrls(node._previewInlineSource || '');
      page.familyNames.forEach((replacement,name)=>{rewritten=rewritten.replace(new RegExp('(^|[^a-zA-Z0-9_-])'+name+'(?=$|[^a-zA-Z0-9_-])','gi'),(_match,before)=>before+replacement);});
      if (value !== rewritten) node.setAttribute('style', rewritten);
      node._previewInlineRendered = rewritten;
    });
    page.root.querySelectorAll('img[data-preview-image]').forEach(image => {
      const url = resourceUrl(image.getAttribute('data-preview-image'));
      if (url && image.getAttribute('src') !== url) image.setAttribute('src',url);
      if (image.hasAttribute('data-preview-observed')) return;
      image.setAttribute('data-preview-observed','');
      function reveal() {
        if (!image.isConnected || !image.complete || !image.naturalWidth || image.hasAttribute('data-preview-loaded')) return;
        void getComputedStyle(image).opacity;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!image.isConnected || !image.complete || !image.naturalWidth || image.hasAttribute('data-preview-loaded')) return;
          image.setAttribute('data-preview-loaded','');
          page.fadeUntil = Math.max(page.fadeUntil,performance.now()+(media.matches ? 0 : 720));
          checkCompletion();
        }));
      }
      image.addEventListener('load',reveal);
      image.addEventListener('error',() => { image.setAttribute('data-preview-error',''); if (!image.getAttribute('alt') && imageErrorText) image.setAttribute('alt',imageErrorText); checkCompletion(); });
      if (image.complete) reveal();
    });
  }
  function updatePage(packet, arrivals) {
    let page = pages.get(packet.route);
    if (page && page.epoch !== packet.epoch) { removePage(page); page=null; }
    if (!page) page=makePage(packet.route,packet.title,packet.epoch);
    page.title=packet.title; page.label.textContent=packet.title;
    if (page.html === packet.html) { page.revision=packet.revision; return; }
    const next=parse(packet.html);
    const nextSections=anchors(next);
    const nextIds=nextSections ? nextSections.map(node => node.id) : null;
    const oldIds=page.ids;
    const stable=!!nextIds && (!page.root || (!!oldIds && oldIds.every((id,index) => nextIds.includes(id) && (index===0 || nextIds.indexOf(oldIds[index-1])<nextIds.indexOf(id)))));
    if (page.root) morph(page.root,next,new Set(nextIds || []));
    else {
      page.observer.disconnect();
      page.root=next;
      page.shadow.replaceChildren(next);
    }
    page.html=packet.html; page.revision=packet.revision; page.ids=nextIds; page.meaningful=meaningful(page.root);
    let internal=page.root.querySelector('style[data-preview-internal]');
    if (!internal) { internal=document.createElement('style'); internal.setAttribute('data-preview-internal',''); page.root.querySelector('head').append(internal); }
    internal.textContent=imageStyle;
    applyResources(page);
    page.observer.observe(page.root);
    if (stable && nextIds) {
      const oldSet=new Set(oldIds || []);
      anchors(page.root).forEach(node => { if (!oldSet.has(node.id)) arrivals.push({page:page,node:node}); });
    } else if (active && !complete && !document.hidden && !media.matches) {
      run(page.host,[{opacity:.55},{opacity:1}],{duration:180});
    }
  }
  function removePage(page) {
    page.observer.disconnect(); page.position.remove(); page.label.remove(); page.fonts.remove(); pages.delete(page.route);
  }
  function layout(animate) {
    pages.forEach(page => {
      page.tail.hidden=!generating || complete;
      page.position.hidden=!page.meaningful;
      page.label.hidden=page.route==='/' || !page.meaningful;
      if (page.root) page.height=Math.max(page.root.offsetHeight,page.root.scrollHeight);
    });
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if (!width || !height) return Promise.resolve();
    const home=pages.get('/');
    const companions=Array.from(pages.values()).filter(page => page.route!=='/' && page.meaningful);
    const narrow=width<620, top=24, bottom=28, gap=narrow?16:32;
    const usable=Math.max(1,height-top-bottom);
    const mainWidth=Math.max(1,Math.min(780,companions.length && !narrow?(width-gap)/1.42:width));
    const moves=[];
    function place(page,x,y,scale) {
      const old=page.position.style.transform;
      const transform='translate('+x+'px,'+y+'px) scale('+scale+')';
      page.position.style.transform=transform; page.x=x;page.y=y;page.scale=scale;
      if (animate && old && old!==transform) moves.push(run(page.position,[{transform:old},{transform:transform}],{duration:260,easing:'cubic-bezier(.22,.65,.3,1)'}));
    }
    waiting.hidden=!!(home && home.meaningful); waiting.textContent=waitingText;
    let homeWidth=mainWidth, homeBottom=top;
    if (home && home.meaningful) {
      const visual=home.height+(home.tail.hidden?0:home.tail.offsetHeight);
      const widthScale=mainWidth/WIDTH;
      // Keep a whole-page overview when it fits; very long pages scroll instead of becoming postage stamps.
      const scale=Math.min(widthScale,Math.max(widthScale*(narrow?1:.8),usable/Math.max(1,visual)));
      place(home,0,top,scale);
      homeWidth=WIDTH*scale;
      homeBottom=top+visual*scale;
    }
    const columns=narrow?Math.min(2,companions.length):companions.length>4?2:1;
    const side=narrow?width:Math.min(width-homeWidth-gap,homeWidth*.42);
    const cellW=Math.max(1,(side-gap*(columns-1))/Math.max(1,columns));
    const columnBottoms=Array.from({length:columns},()=>narrow?homeBottom+gap:0);
    companions.forEach((page,index) => {
      const column=index%columns;
      const visual=page.height+(page.tail.hidden?0:page.tail.offsetHeight);
      const scale=Math.min(cellW/WIDTH,homeWidth/WIDTH*.52);
      const x=(narrow?0:homeWidth+gap)+column*(cellW+gap);
      const y=columnBottoms[column];
      place(page,x,y+24,scale);
      page.label.style.left=x+'px';page.label.style.top=y+'px';page.label.style.width=WIDTH*scale+'px';
      columnBottoms[column]=y+24+visual*scale+gap;
    });
    const contentBottom=Math.max(homeBottom,...columnBottoms.map(value=>value-gap));
    scene.style.height=Math.max(height,Math.ceil(contentBottom+bottom))+'px';
    return Promise.all(moves);
  }
  function fly(entry,index,current) {
    const page=entry.page,node=entry.node;
    if (current!==version || !node.isConnected) return Promise.resolve();
    const bounds=node.getBoundingClientRect();
    const rootBounds=page.root.getBoundingClientRect();
    const naturalWidth=bounds.width/page.scale,naturalHeight=bounds.height/page.scale;
    const overlay=document.createElement('div');overlay.className='preview-flight';
    overlay.style.width=naturalWidth+'px';overlay.style.height=naturalHeight+'px';
    const crop=document.createElement('div');crop.className='preview-crop';
    crop.style.transform='translate('+(-(bounds.left-rootBounds.left)/page.scale)+'px,'+(-(bounds.top-rootBounds.top)/page.scale)+'px)';
    const shadow=crop.attachShadow({mode:'closed'});
    const copy=page.root.cloneNode(true);
    copy.querySelectorAll('[style]').forEach(element => { if (element.style.visibility==='hidden') element.style.visibility=''; });
    shadow.append(copy); overlay.append(crop);flightLayer.append(overlay);
    const slot=document.createElement('div');slot.className='preview-slot';
    const targetTop=bounds.top+viewport.scrollTop;
    Object.assign(slot.style,{left:bounds.left+'px',top:targetTop+'px',width:bounds.width+'px',height:bounds.height+'px'});
    flightLayer.append(slot);
    const scale=page.scale, from='translate('+(bounds.left-bounds.width*.06)+'px,'+(viewport.scrollTop-naturalHeight*scale*1.12-24)+'px) scale('+(scale*1.12)+')';
    const to='translate('+bounds.left+'px,'+targetTop+'px) scale('+scale+')';
    overlay.style.transform=to;
    return run(overlay,[{transform:from,opacity:.72},{transform:to,opacity:1}],{duration:900,delay:index*90,easing:'cubic-bezier(.2,.64,.22,1)',fill:'backwards'}).then(() => {
      overlay.remove();slot.remove();node.style.visibility='';hidden.delete(node);
      if (current===version) page.tail.classList.remove('arriving');
    });
  }
  function flush() {
    frame=0;
    if (disposed || !pending.size) return;
    cancelMotion();
    const arrivals=[];
    pending.forEach(packet => updatePage(packet,arrivals));pending.clear();
    emitStatus(); if (pressure && pruneResources(true)) pressure=false;
    const moving=active && !complete && !document.hidden && !media.matches;
    const selected=moving ? arrivals.sort((a,b)=>Number(b.page.route==='/')-Number(a.page.route==='/')).slice(0,2) : [];
    selected.forEach(entry => { entry.node.style.visibility='hidden';hidden.add(entry.node);entry.page.tail.classList.add('arriving'); });
    const current=version;
    layout(moving).then(() => {
      if (current!==version) return;
      return Promise.all(selected.map((entry,index)=>fly(entry,index,current)));
    }).then(() => { if (current===version) checkCompletion(); });
  }
  function reframe() {
    if (frame) cancelAnimationFrame(frame);
    frame=requestAnimationFrame(() => { frame=0;cancelMotion();if(pending.size)flush();else layout(false).then(checkCompletion); });
  }
  function pruneResources(force) {
    if(!force)return 0;
    const ids=new Set();
    pages.forEach(page => { const matches=page.html.match(/[a-f0-9]{64}/g)||[];matches.forEach(id=>ids.add(id)); });
    pending.forEach(packet => { const matches=packet.html.match(/[a-f0-9]{64}/g)||[];matches.forEach(id=>ids.add(id)); });
    const evicted=[];resources.forEach((asset,id)=>{if(!ids.has(id)){URL.revokeObjectURL(asset.url);bytes-=asset.size;resources.delete(id);evicted.push(id);}});if(evicted.length)send('evicted',{ids:evicted});return evicted.length;
  }
  function revealBackgrounds(page, url) {
    if (!page.root || !active || document.hidden || media.matches) return;
    const body=page.root.querySelector('body');
    if (!body) return;
    let count=0;
    const nodes=body.querySelectorAll('*');
    for (let index=0; index<nodes.length && index<4000 && count<MAX_BACKGROUND_REVEALS; index++) {
      const node=nodes[index];
      if (!getComputedStyle(node).backgroundImage.includes(url)) continue;
      count++;
      const animation=node.animate([{opacity:.35},{opacity:1}],{duration:650,easing:'cubic-bezier(.4,0,.2,1)'});
      reveals.add(animation);
      animation.finished.catch(() => {}).then(() => reveals.delete(animation));
    }
    if (count) page.fadeUntil=Math.max(page.fadeUntil,performance.now()+650);
  }
  function markReady(id, entry, image) {
    if (disposed || resources.get(id)!==entry || entry.ready) return;
    entry.ready=true;
    pages.forEach(page => {
      applyResources(page);
      if (image && page.html.includes(id)) revealBackgrounds(page, entry.url);
    });
    checkCompletion();
  }
  function addAssets(batch) {
    if (!Array.isArray(batch) || batch.length>MAX_ASSETS) return;
    if (pending.size) flush();
    pruneResources();
    let incoming=0;
    const rejected=[];
    batch.forEach(asset => {
      if (!asset || !/^[a-f0-9]{64}$/.test(asset.id) || !/^(?:image\/(?:png|jpeg|webp|gif|avif)|font\/woff2?)$/.test(asset.mimeType) || !(asset.bytes instanceof ArrayBuffer) || !asset.bytes.byteLength || asset.bytes.byteLength>8388608) return;
      incoming+=asset.bytes.byteLength;
      if (resources.has(asset.id)) return;
      if (incoming>MAX_BYTES) { rejected.push(asset.id); return; }
      if(resources.size>=MAX_ASSETS || bytes+asset.bytes.byteLength>MAX_BYTES)pruneResources(true);
      if(resources.size>=MAX_ASSETS || bytes+asset.bytes.byteLength>MAX_BYTES) { rejected.push(asset.id); return; }
      const image=asset.mimeType.startsWith('image/');
      const entry={url:URL.createObjectURL(new Blob([asset.bytes],{type:asset.mimeType})),size:asset.bytes.byteLength,ready:!image};
      resources.set(asset.id,entry);bytes+=entry.size;
      if (image) {
        // Decode first so a late CSS background or image never paints progressively.
        const probe=new Image();
        probe.src=entry.url;
        const decoded=typeof probe.decode==='function' ? probe.decode() : Promise.resolve();
        let timer=0;
        const limit=new Promise(resolve => { timer=setTimeout(resolve,DECODE_TIMEOUT); });
        Promise.race([decoded,limit]).catch(() => {}).then(() => { clearTimeout(timer); markReady(asset.id,entry,true); });
      }
    });
    if (rejected.length) { pressure=true; send('rejected',{ids:rejected}); }
    pages.forEach(applyResources);
    emitStatus();
  }
  function checkCompletion() {
    if (!complete || !active || document.hidden || hidden.size || motions.size || pending.size) return;
    const now=performance.now();
    if (completeAt===null) completeAt=now;
    const budget=Math.max(0,completeAt+SETTLE_BUDGET-now);
    let index=0;
    pages.forEach(page => {
      if (!page.meaningful || page.polished || page.polishing) return;
      // Failed images are settled; missing or still-decoding ones only delay the cue within the budget.
      const images=Array.from(page.root.querySelectorAll('img[data-preview-image]'));
      const unsettled=images.some(image=>!image.hasAttribute('data-preview-loaded') && !image.hasAttribute('data-preview-error'));
      const remaining=unsettled ? budget : Math.min(budget,Math.max(0,page.fadeUntil-now));
      if (remaining>0) { if (!page.fadeTimer) page.fadeTimer=later(()=>{page.fadeTimer=null;checkCompletion();},remaining+16);return; }
      page.polishing=true;
      const current=version;
      later(()=>{
        page.polishing=false;
        if (current!==version || !complete || !active || document.hidden || page.polished) return;
        page.polished=true;page.surface.classList.add('is-polished');
        let gloss=null,timer=null;
        function cleanup(){if(timer){clearTimeout(timer);timers.delete(timer);}gloss&&gloss.remove();page.surface.classList.remove('is-polished');page.surface.removeEventListener('animationend',ended);completions.delete(cleanup);}
        function ended(event){if(event.target===page.surface && event.animationName==='preview-lift')cleanup();}
        completions.add(cleanup);
        if (!media.matches) {
          gloss=document.createElement('div');gloss.className='completion-gloss';gloss.setAttribute('aria-hidden','true');
          const band=document.createElement('div');band.className='completion-sheen';gloss.append(band);page.surface.append(gloss);
          page.surface.addEventListener('animationend',ended);timer=later(cleanup,1600);
        }
      },Math.min(index++*90,180));
    });
  }
  function config(data) {
    if (typeof data.active!=='boolean' || typeof data.generating!=='boolean' || typeof data.complete!=='boolean') return;
    const changed=active!==data.active || complete!==data.complete;
    active=data.active;generating=data.generating;complete=data.complete;
    if (!complete) completeAt=null;
    waitingText=typeof data.waiting==='string'?data.waiting.slice(0,180):'';
    imageErrorText=typeof data.imageError==='string'?data.imageError.slice(0,180):'';
    if (changed || !active || complete) cancelMotion();
    pages.forEach(page=>{page.polishing=false;page.fadeTimer=null;});
    if (pending.size) flush();
    layout(false).then(checkCompletion);
  }
  let roster='';
  function receive(event) {
    const data=event.data;
    if (!data || data.v!==1 || data.channel!==channel || typeof data.type!=='string') return;
    if(data.type==='render') {
      if (typeof data.route!=='string' || data.route.length>200 || !/^\/[^\s?#\\]*$/.test(data.route) || typeof data.epoch!=='string' || !/^\d+:\d+$/.test(data.epoch) || !Number.isSafeInteger(data.revision) || data.revision<1 || typeof data.html!=='string' || !data.html.length || data.html.length>MAX_HTML || typeof data.title!=='string' || data.title.length>100 || (!pages.has(data.route) && !pending.has(data.route) && pages.size+pending.size>=24))return;
      const previous=pending.get(data.route)||pages.get(data.route);
      if(previous){const a=previous.epoch.split(':').map(Number),b=data.epoch.split(':').map(Number);if(b[0]<a[0] || (b[0]===a[0] && b[1]<a[1]) || (data.epoch===previous.epoch && data.revision<=previous.revision))return;}
      pending.set(data.route,data);if(!active || document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;flush();}else if(!frame)frame=requestAnimationFrame(flush);
    } else if(data.type==='assets')addAssets(data.assets);
    else if(data.type==='config')config(data);
    else if(data.type==='routes' && Array.isArray(data.routes) && data.routes.length<=24){if(data.routes.some(route=>typeof route!=='string'||!/^\/[^\s?#\\]*$/.test(route)||route.length>200))return;const signature=data.routes.slice().sort().join('\n');if(signature===roster)return;roster=signature;cancelMotion();pages.forEach(page=>{if(!data.routes.includes(page.route))removePage(page);});pending.forEach((_,route)=>{if(!data.routes.includes(route))pending.delete(route);});if(pruneResources(true))pressure=false;emitStatus();layout(false).then(checkCompletion);}
  }
  function connect(event) {
    if(event.source!==parent || event.origin!==parentOrigin || !event.data || event.data.v!==1 || event.data.channel!==channel || event.data.type!=='connect' || event.ports.length!==1 || port)return;
    port=event.ports[0];window.removeEventListener('message',connect);port.onmessage=receive;port.start();send('ready',{});
  }
  window.addEventListener('message',connect);
  window.addEventListener('resize',reframe);
  document.addEventListener('visibilitychange',()=>{cancelMotion();cancelReveals();pages.forEach(page=>{page.polishing=false;page.fadeTimer=null;});if(!document.hidden)layout(false).then(checkCompletion);});
  media.addEventListener('change',()=>{cancelMotion();cancelReveals();pages.forEach(page=>{page.polishing=false;page.fadeTimer=null;});layout(false).then(checkCompletion);});
  document.addEventListener('click',event=>event.preventDefault(),true);
  document.addEventListener('submit',event=>event.preventDefault(),true);
  window.addEventListener('pagehide',()=>{disposed=true;cancelMotion();cancelReveals();pages.forEach(page=>page.observer.disconnect());resources.forEach(asset=>URL.revokeObjectURL(asset.url));resources.clear();if(port)port.close();});
})();
`;
