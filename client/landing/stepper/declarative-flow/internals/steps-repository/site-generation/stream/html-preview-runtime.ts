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
  let port = null, active = false, complete = false, finishing = false;
  let version = 0, bytes = 0, frame = 0, disposed = false;
  let waitingText = '', imageErrorText = '';
  let homeReady = false, homeTimer = null;
  let completeAt = null;
  let presentation = 'building', presenting = false, needsLayout = false;
  // The walk through the finished pages while the host polishes the site.
  const TOUR_HOLD = 5600;
  let tour = null, tourInterrupted = false;
  // With the preview up, a lull with nothing arriving also starts the walk;
  // the next arrival ends it so the camera can follow the work instead.
  const IDLE_MS = 6000;
  let idleTimer = null, idleWalk = false;
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
  flightLayer.setAttribute('inert', '');
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
    '.preview-flight{position:absolute;left:0;top:0;overflow:hidden;transform-origin:0 0;pointer-events:none;background:Canvas;box-shadow:0 18px 48px color-mix(in srgb,CanvasText 13%,transparent);z-index:4}',
    '.preview-crop{position:absolute;left:0;top:0;width:1040px;container-type:inline-size}',
    '.preview-slot{position:absolute;pointer-events:none;border:1px dashed color-mix(in srgb,CanvasText 20%,transparent);background:color-mix(in srgb,Canvas 25%,transparent);z-index:3}',
    '.completion-gloss{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:6}',
    '.completion-sheen{position:absolute;inset-block:0;left:0;width:300%;background:linear-gradient(112deg,transparent 43%,color-mix(in srgb,Canvas 28%,transparent) 47%,color-mix(in srgb,Canvas 60%,transparent) 50%,transparent 57%);animation:preview-sheen 1150ms cubic-bezier(.45,0,.25,1) 1 forwards}',
    '.is-polished{animation:preview-lift 1400ms ease-in-out 1}.is-polished:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:4;box-shadow:0 0 0 2px color-mix(in srgb,Highlight 22%,transparent);animation:preview-halo 1400ms ease-out 1}',
    '@keyframes preview-sheen{0%{transform:translateX(-66.667%);opacity:0}12%,85%{opacity:1}100%{transform:translateX(0);opacity:0}}',
    '@keyframes preview-lift{0%,100%{filter:brightness(1)}45%{filter:brightness(1.04)}}',
    '@keyframes preview-halo{0%,100%{opacity:0}40%{opacity:1}}',
    '.preview-scene.is-touring .preview-page{transition:opacity 700ms ease}.preview-scene.is-touring .preview-page:not(.is-touring){opacity:.6}',
    '.preview-page.is-touring .preview-surface{box-shadow:0 0 0 2px color-mix(in srgb,Highlight 24%,transparent),0 14px 36px color-mix(in srgb,CanvasText 14%,transparent);transition:box-shadow 700ms ease}',
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
    if (presentation==='returning' || presentation==='revealing') {
      presentation='showcase';pages.forEach(page=>{page.revealed=true;});
    }
    motions.forEach(animation => animation.cancel()); motions.clear();
    if (tour) { if (tour.animation) tour.animation.cancel(); tour.animation=null; clearTimeout(tour.read); tour.read=null; }
    hidden.forEach(node => { node.style.visibility = ''; }); hidden.clear();
    flightLayer.replaceChildren();
    completions.forEach(cleanup => cleanup()); completions.clear();
    timers.forEach(timer => clearTimeout(timer)); timers.clear();
    pages.forEach(page => { page.polishing=false; page.fadeTimer=null; });
  }
  function cancelReveals() { reveals.forEach(animation => animation.cancel()); reveals.clear(); }
  function run(element, frames, options) {
    const animation = element.animate(frames, options);
    motions.add(animation);
    return animation.finished.catch(() => {}).then(() => { motions.delete(animation); });
  }
  function releaseBufferedPages() {
    const buffered=Array.from(pages.values()).filter(page=>page.route!=='/' && page.meaningful && !page.revealed);
    buffered.forEach(page=>{page.revealed=true;});
    return buffered;
  }
  function finishPresentation() {
    presenting=false;
    setTimeout(startTour,600);
    if (disposed) return;
    if (needsLayout) { needsLayout=false;layout(false); }
    if (pending.size || pages.get('/')?.featurePending) flush();
    else { advancePresentation();checkCompletion(); }
  }
  function advancePresentation() {
    if (disposed || presenting || !active || document.hidden) return;
    const home=pages.get('/');
    if (!home || !home.meaningful || (!home.ready && !complete && !finishing) || (home.featurePending && !complete && !media.matches)) return;
    if (media.matches || complete) {
      presentation='showcase';releaseBufferedPages();layout(false).then(checkCompletion);return;
    }
    const returning=presentation==='building';
    if (!returning && !Array.from(pages.values()).some(page=>page.route!=='/' && page.meaningful && !page.revealed)) return;
    presenting=true;
    const current=version;
    presentation=returning?'returning':'revealing';
    const camera=returning?layout(true,1600):Promise.resolve();
    camera.then(async ()=>{
      if (current!==version || disposed) return;
      presentation='revealing';
      const buffered=releaseBufferedPages();
      const moving=layout(true,750);
      const queue=buffered.map(page=>{
        const sections=(anchors(page.root) || []).filter(node=>hasSectionContent(node));
        const footers=Array.from(page.root.querySelectorAll('footer'));
        [page.position,page.label,...sections,...footers].forEach(node=>{node.style.visibility='hidden';hidden.add(node);});
        return {page,sections,footers};
      });
      await moving;
      for (const {page,sections,footers} of queue) {
        if (current!==version || disposed) return;
        [page.position,page.label].forEach(node=>{node.style.visibility='';hidden.delete(node);});
        await run(page.host,[{opacity:0},{opacity:1}],{duration:240,easing:'ease-out'});
        for (const node of sections) {
          if (current!==version || disposed) return;
          await fly({page,node},0,current);
        }
        if (current!==version || disposed) return;
        footers.forEach(node=>{node.style.visibility='';hidden.delete(node);});
      }
    }).then(()=>{
      if (current===version) { presentation='showcase';scene.dataset.presentation=presentation; }
    }).finally(finishPresentation);
  }
  function emitStatus() {
    const home = pages.get('/');
    const ready = !!(home && home.meaningful);
    if (homeReady !== ready) { homeReady = ready; send('status', { homeReady:ready }); }
  }
  function resourceUrl(id) { const asset=resources.get(id); return asset && asset.ready ? asset.url : ''; }
  const imagePlaceholder='linear-gradient(110deg,color-mix(in srgb,currentColor 9%,transparent),color-mix(in srgb,currentColor 4%,transparent))';
  function rewriteUrls(value) {
    return value.replace(/url\(\s*["']?(?:preview-asset:([a-f0-9]{64})|preview-pending:image)["']?\s*\)/gi, (_match, id) => {
      const url=id && resourceUrl(id);
      return url?'url("'+url+'")':imagePlaceholder;
    });
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
  const imageStyle = [
    ':where(img[data-preview-image]:not([data-preview-loaded]),img[data-preview-pending]){aspect-ratio:4/3}',
    ':where(img[data-preview-image]:not([data-preview-loaded]):not([width]),img[data-preview-pending]:not([width])){width:100%}',
    'img[data-preview-image]:not([data-preview-loaded]),img[data-preview-pending]{display:inline-block;content:'+imagePlaceholder+'!important;opacity:1!important;animation:preview-image-pulse 2.4s ease-in-out infinite!important}',
    'img[data-preview-loaded]{opacity:1}',
    'img[data-preview-image][data-preview-error],html[data-preview-settled] img:not([data-preview-loaded]){animation:none!important}',
    '@keyframes preview-image-pulse{0%,100%{filter:opacity(.55)}50%{filter:opacity(1)}}',
    '@media(prefers-reduced-motion:reduce){img[data-preview-image]:not([data-preview-loaded]),img[data-preview-pending],*,*:before,*:after{animation:none!important;transition:none!important}}'
  ].join('\n');
  function parse(html) {
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    parsed.querySelectorAll('script,meta,base,link,noscript,template,iframe,object,embed').forEach(node => node.remove());
    parsed.querySelectorAll('[nonce],[src],[srcset],[sizes]').forEach(node => {
      ['nonce','src','srcset','sizes'].forEach(name => node.removeAttribute(name));
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
  function makePage(route, title, epoch) {
    const position = document.createElement('div'); position.className = 'preview-page';
    const surface = document.createElement('div'); surface.className = 'preview-surface';
    const host = document.createElement('div'); host.className = 'preview-host'; host.setAttribute('inert','');
    const shadow = host.attachShadow({mode:'closed'});
    surface.append(host); position.append(surface); scene.insertBefore(position, flightLayer);
    const label = document.createElement('div'); label.className = 'preview-title'; label.textContent = title;
    scene.insertBefore(label, flightLayer);
    const fonts = document.createElement('style'); document.head.append(fonts);
    const familyNames=new Map();familyNames.prefix=String(pages.size)+'-'+Math.random().toString(36).slice(2,10);
    const page = {familyNames:familyNames,route:route,title:title,epoch:epoch,position:position,surface:surface,host:host,shadow:shadow,label:label,fonts:fonts,ready:false,revealed:route==='/',featured:new Set(),sections:new Map(),featurePending:false,stable:false,root:null,html:'',ids:null,meaningful:false,height:0,scale:1,x:0,y:0,polished:false,fadeUntil:0};
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
      if (hidden.has(node)) node.style.visibility='';
      const value = node.getAttribute('style');
      if (value !== node._previewInlineRendered) node._previewInlineSource = value;
      let rewritten = rewriteUrls(node._previewInlineSource || '');
      page.familyNames.forEach((replacement,name)=>{rewritten=rewritten.replace(new RegExp('(^|[^a-zA-Z0-9_-])'+name+'(?=$|[^a-zA-Z0-9_-])','gi'),(_match,before)=>before+replacement);});
      if (value !== rewritten) node.setAttribute('style', rewritten);
      node._previewInlineRendered = rewritten;
      if (hidden.has(node)) node.style.visibility='hidden';
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
          if (active && !document.hidden && !media.matches) {
            const animation=image.animate([{opacity:0},{opacity:1}],{duration:720,easing:'cubic-bezier(.4,0,.2,1)'});
            reveals.add(animation);
            animation.finished.catch(() => {}).then(() => reveals.delete(animation));
            spotlightImage(page,image);
          }
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
    page.title=packet.title; page.label.textContent=packet.title;page.ready=page.ready || packet.ready===true;
    if (page.html === packet.html) { page.revision=packet.revision; return; }
    const next=parse(packet.html);
    const nextSections=anchors(next);
    const nextIds=nextSections ? nextSections.map(node => node.id) : null;
    const oldIds=page.ids;
    if (page.route==='/') {
      const now=performance.now();
      (nextSections || []).forEach(node=>{
        const previous=page.sections.get(node.id);
        if (!previous || previous.html!==node.outerHTML) page.sections.set(node.id,{html:node.outerHTML,changedAt:now});
      });
      page.sections.forEach((_,id)=>{if (!nextIds?.includes(id)) page.sections.delete(id);});
    }
    const stable=!!nextIds && (!page.root || (!!oldIds && oldIds.every((id,index) => nextIds.includes(id) && (index===0 || nextIds.indexOf(oldIds[index-1])<nextIds.indexOf(id)))));
    if (page.root) morph(page.root,next,new Set(nextIds || []));
    else {
      page.observer.disconnect();
      page.root=next;
      page.shadow.replaceChildren(next);
    }
    page.stable=stable;
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
    if (page.route==='/') { presentation='building';pages.forEach(item=>{item.revealed=item.route==='/';}); }
    page.observer.disconnect(); page.position.remove(); page.label.remove(); page.fonts.remove(); pages.delete(page.route);
  }
  function layout(animate,duration=360) {
    const home=pages.get('/');
    if ((complete || media.matches) && (complete || (home && home.ready))) {
      presentation='showcase';releaseBufferedPages();
    }
    scene.dataset.presentation=presentation;
    pages.forEach(page => {
      if (page.root) page.root.toggleAttribute('data-preview-settled',complete);
      page.position.hidden=!page.meaningful || !page.revealed;
      page.label.hidden=page.position.hidden || (page.route==='/' && presentation==='returning');
      if (page.root) page.height=Math.max(page.root.offsetHeight,page.root.scrollHeight);
    });
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if (!width || !height) return Promise.resolve();
    const companions=Array.from(pages.values()).filter(page => page.route!=='/' && page.meaningful && page.revealed);
    const narrow=width<620, top=24, bottom=28, gap=narrow?16:24, rowGap=16;
    const usable=Math.max(1,height-top-bottom);
    const companionHeight=narrow && companions.length?Math.min(170,usable*.25):0;
    const mainHeight=Math.max(1,usable-(companionHeight?companionHeight+gap:0));
    const mainWidth=Math.max(1,companions.length && !narrow?(width-gap)/1.6:Math.min(936,width));
    const moves=[],placements=[];
    function place(page,x,y,scale) {
      const old=page.position.style.transform;
      const transform='translate('+x+'px,'+y+'px) scale('+scale+')';
      page.position.style.transform=transform; page.x=x;page.y=y;page.scale=scale;
      if (animate && old && old!==transform) {
        const frames=[{transform:old},{transform:transform}];
        if (page.route==='/' && presentation==='returning') {
          const lower=Math.min(y,height-bottom-page.height*scale);
          frames[0].easing='cubic-bezier(.4,0,.2,1)';
          frames.splice(1,0,{transform:'translate('+x+'px,'+lower+'px) scale('+scale+')',offset:.28,easing:'cubic-bezier(.22,1,.36,1)'});
        }
        moves.push(run(page.position,frames,{duration:duration,easing:presentation==='returning'?'linear':'cubic-bezier(.22,1,.36,1)'}));
      }
    }
    waiting.hidden=!!(home && home.meaningful); waiting.textContent=waitingText;
    let homeWidth=mainWidth, homeBottom=top;
    if (home && home.meaningful) {
      const visual=home.height;
      const widthScale=mainWidth/WIDTH;
      const scale=presentation==='building'?Math.min(widthScale,mainHeight/Math.max(1,visual)):widthScale;
      homeWidth=WIDTH*scale;
      placements.push({page:home,x:0,y:top,scale:scale});
      homeBottom=top+visual*scale;
    }
    const columns=narrow?Math.min(2,companions.length):companions.length>4?2:1;
    const side=narrow?width:Math.min(width-homeWidth-gap,homeWidth*.6);
    const cellW=Math.max(1,(side-gap*(columns-1))/Math.max(1,columns));
    const columnBottoms=Array.from({length:columns},()=>narrow?homeBottom+gap:0);
    const companionScale=cellW/WIDTH;
    companions.forEach((page,index) => {
      const column=index%columns;
      const visual=page.height;
      const scale=companionScale;
      const x=(narrow?0:homeWidth+gap)+column*(cellW+gap);
      const y=columnBottoms[column];
      placements.push({page:page,x:x,y:y+24,scale:scale});
      columnBottoms[column]=y+24+visual*scale+rowGap;
    });
    const companionPlacements=placements.filter(item=>item.page!==home);
    const columnWidths=Array.from({length:columns},()=>0);
    companionPlacements.forEach((item,index)=>{const column=index%columns;columnWidths[column]=Math.max(columnWidths[column],WIDTH*item.scale);});
    const companionWidth=columnWidths.reduce((sum,value)=>sum+value,0)+gap*Math.max(0,columns-1);
    companionPlacements.forEach((item,index)=>{
      const column=index%columns;
      item.x=(narrow?0:homeWidth+gap)+columnWidths.slice(0,column).reduce((sum,value)=>sum+value,0)+gap*column;
    });
    const groupWidth=Math.max(0,...placements.map(item=>item.x+WIDTH*item.scale));
    const groupLeft=companions.length && !narrow?0:Math.max(0,(width-groupWidth)/2);
    placements.forEach(item=>{
      const x=narrow?(item.page===home?(width-WIDTH*item.scale)/2:item.x+(width-companionWidth)/2):item.x+groupLeft;
      place(item.page,x,item.y,item.scale);
      item.page.label.style.left=x+'px';item.page.label.style.top=(item.y-24)+'px';item.page.label.style.width=WIDTH*item.scale+'px';
    });
    const contentBottom=Math.max(homeBottom,...columnBottoms.map(value=>value-rowGap));
    scene.style.height=Math.max(height,Math.round(contentBottom+bottom))+'px';
    return Promise.all(moves);
  }
  function hasSectionContent(section, beyondHeading=false) {
    const bounds=section.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return false;
    const walker=document.createTreeWalker(section,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    let node=section,count=0;
    while (node && count++<4000) {
      const element=node.nodeType===1?node:node.parentElement;
      const style=getComputedStyle(element);
      const visible=style.display!=='none' && style.visibility!=='hidden' && Number(style.opacity)!==0;
      if (visible && (!beyondHeading || !element.closest('h1,h2,h3,h4,h5,h6')) && node.nodeType===3 && node.textContent.trim() && !/^(STYLE|SCRIPT)$/.test(element.tagName)) {
        const range=document.createRange();range.selectNodeContents(node);
        if (Array.from(range.getClientRects()).some(rect=>rect.width && rect.height && rect.right>bounds.left && rect.left<bounds.right && rect.bottom>bounds.top && rect.top<bounds.bottom)) return true;
      }
      if (visible && node.nodeType===1) {
        const rect=node.getBoundingClientRect();
        if (rect.width && rect.height && ((node.tagName==='IMG' && node.hasAttribute('data-preview-loaded') && node.naturalWidth) || style.backgroundImage.includes('blob:'))) return true;
      }
      node=walker.nextNode();
    }
    return false;
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
    const scale=page.scale;
    const assemblingHome=page.route==='/' && presentation==='building';
    const displayScale=assemblingHome?Math.max(scale,Math.min(viewport.clientWidth*.82/naturalWidth,viewport.clientHeight*.68/naturalHeight,Math.max(scale*1.65,viewport.clientWidth*.62/naturalWidth),1.05)):scale*1.08;
    const centerX=(viewport.clientWidth-naturalWidth*displayScale)/2;
    const centerY=viewport.scrollTop+(viewport.clientHeight-naturalHeight*displayScale)/2;
    const from='translate('+centerX+'px,'+(viewport.scrollTop-naturalHeight*displayScale-24)+'px) scale('+displayScale+')';
    const spotlight='translate('+centerX+'px,'+centerY+'px) scale('+displayScale+')';
    const to='translate('+bounds.left+'px,'+targetTop+'px) scale('+scale+')';
    overlay.style.transform=to;
    const frames=assemblingHome?[
      {transform:from,opacity:.72,offset:0,easing:'cubic-bezier(.22,1,.36,1)'},
      {transform:spotlight,opacity:1,offset:.22},
      {transform:spotlight,opacity:1,offset:.62,easing:'cubic-bezier(.4,0,.2,1)'},
      {transform:to,opacity:1,offset:.95},
      {transform:to,opacity:1,offset:1}
    ]:[{transform:from,opacity:.72},{transform:to,opacity:1}];
    return run(overlay,frames,{duration:assemblingHome?2200:800,easing:assemblingHome?'linear':'cubic-bezier(.16,1,.3,1)',fill:'backwards'}).then(() => {
      overlay.remove();slot.remove();node.style.visibility='';hidden.delete(node);
    });
  }
  function homepageArrivals(moving) {
    const page=pages.get('/');
    if (!page) return [];
    page.featurePending=false;
    if (!page.stable || !page.meaningful || !active) return [];
    page.position.hidden=false;
    const selected=[];
    let delay=Infinity;
    (anchors(page.root) || []).forEach(node=>{
      if (page.featured.has(node.id)) return;
      if (!moving || presentation!=='building') { page.featured.add(node.id);return; }
      if (!hasSectionContent(node)) return;
      const section=page.sections.get(node.id);
      const remaining=Math.max(0,1200-(performance.now()-(section?.changedAt || 0)));
      // A heading can precede its body by several snapshots. Readiness releases intentional heading-only sections.
      const composed=page.ready || hasSectionContent(node,true);
      node.style.visibility='hidden';hidden.add(node);
      if (composed && !remaining) {
        page.featured.add(node.id);selected.push({page,node});
      } else {
        page.featurePending=true;
        if (composed) delay=Math.min(delay,remaining);
      }
    });
    if (Number.isFinite(delay)) homeTimer=setTimeout(()=>{homeTimer=null;flush();},delay);
    return selected;
  }
  function flush() {
    frame=0;
    if (disposed || presenting) return;
    if (homeTimer!==null) { clearTimeout(homeTimer);homeTimer=null; }
    cancelMotion();
    const arrivals=[];
    pending.forEach(packet => updatePage(packet,arrivals));pending.clear();
    emitStatus(); if (pressure && pruneResources(true)) pressure=false;
    const moving=active && !complete && !document.hidden && !media.matches;
    const selected=homepageArrivals(moving);
    if (moving) selected.push(...arrivals.filter(entry=>entry.page.route!=='/' && entry.page.revealed && presentation==='showcase' && hasSectionContent(entry.node)));
    // Only something the user can see moving counts as activity for the idle
    // walk; a re-render that changes nothing on screen must not hold it off.
    if (selected.length) noteActivity();
    selected.forEach(entry => { entry.node.style.visibility='hidden';hidden.add(entry.node); });
    const current=version;
    if (!moving || !selected.length) { layout(moving).then(()=>{advancePresentation();checkCompletion();});return; }
    presenting=true;
    layout(true).then(async () => {
      for (const entry of selected) {
        if (current!==version) return;
        await follow(entry.page);
        if (current!==version) return;
        await fly(entry,0,current);
      }
    }).finally(finishPresentation);
  }
  function reframe() {
    if (presenting) { needsLayout=true;return; }
    if (frame) cancelAnimationFrame(frame);
    frame=requestAnimationFrame(flush);
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
  // A picture that has just landed gets a ring that fades out, and the camera
  // moves to it when it landed off screen (no more than once every few
  // seconds, and never while the user or the walk has the camera).
  let lastImageGlide=0;
  function spotlightImage(page,image) {
    const ring=image.animate([
      {boxShadow:'0 0 0 2px color-mix(in srgb,Highlight 45%,transparent)'},
      {boxShadow:'0 0 0 16px color-mix(in srgb,Highlight 0%,transparent)'}
    ],{duration:900,easing:'cubic-bezier(.22,1,.36,1)'});
    reveals.add(ring); ring.finished.catch(() => {}).then(() => reveals.delete(ring));
    if (tour || tourInterrupted || presenting || page.position.hidden || !page.revealed) return;
    const now=performance.now();
    if (now-lastImageGlide<3500) return;
    const rect=image.getBoundingClientRect(), room=viewport.clientHeight;
    if (rect.top>=0 && rect.bottom<=room) return;
    lastImageGlide=now;
    const maxTop=Math.max(0,scene.offsetHeight-room);
    glideTo(Math.min(maxTop,Math.max(0,viewport.scrollTop+rect.top-Math.max(0,(room-rect.height)/2))),800);
  }
  function markReady(id, entry, image) {
    if (disposed || resources.get(id)!==entry || entry.ready) return;
    entry.ready=true;
    if (image) noteActivity();
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
  function tourPages() {
    return Array.from(pages.values()).filter(page=>page.meaningful && page.revealed && !page.position.hidden)
      .sort((a,b)=>a.route==='/'?-1:b.route==='/'?1:(a.y-b.y)||(a.x-b.x));
  }
  // One camera for the walk and for following section flights; a user scroll
  // (interruptCamera) takes it back until the host moves to the finishing phase.
  // A cancelled glide still settles: flush() awaits it before the next flight.
  let cameraFrame=0, cameraSettle=null;
  function cancelCamera() {
    if (cameraFrame) cancelAnimationFrame(cameraFrame);
    cameraFrame=0;
    const settle=cameraSettle; cameraSettle=null;
    if (settle) settle();
  }
  function glideTo(top, duration) {
    return new Promise(resolve=>{
      cancelCamera();
      const start=viewport.scrollTop, delta=top-start, began=performance.now();
      if (Math.abs(delta)<2 || media.matches || document.hidden) { viewport.scrollTop=top; resolve(); return; }
      cameraSettle=resolve;
      const step=now=>{
        const p=Math.min(1,(now-began)/duration), e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
        viewport.scrollTop=start+delta*e;
        if (p<1) cameraFrame=requestAnimationFrame(step); else { cameraFrame=0; cameraSettle=null; resolve(); }
      };
      cameraFrame=requestAnimationFrame(step);
    });
  }
  function glide(top, duration) { if (tour) glideTo(top,duration); }
  function follow(page) {
    if (tourInterrupted || tour || media.matches || page.route==='/' || presentation!=='showcase') return Promise.resolve();
    const offset=page.y-viewport.scrollTop, room=viewport.clientHeight;
    if (offset>=0 && offset<room*.55) return Promise.resolve();
    const maxTop=Math.max(0,scene.offsetHeight-room);
    return glideTo(Math.min(maxTop,Math.max(0,page.y-40)),700);
  }
  function stopTour() {
    if (!tour) return;
    clearTimeout(tour.timer); clearTimeout(tour.read);
    cancelCamera();
    if (tour.animation) tour.animation.cancel();
    tour=null;
    scene.classList.remove('is-touring');
    pages.forEach(page=>page.position.classList.remove('is-touring'));
    send('tour',{title:null});
  }
  function tourStep() {
    if (!tour) return;
    const list=tourPages();
    if (!list.length) { tour.timer=setTimeout(tourStep,1000); return; }
    const page=list[tour.index%list.length];
    pages.forEach(item=>item.position.classList.toggle('is-touring',item===page));
    const visual=page.height*page.scale, room=viewport.clientHeight;
    const maxTop=Math.max(0,scene.offsetHeight-room);
    const top=Math.min(maxTop,Math.max(0,page.y-24-Math.max(0,(room-visual-24)/2)));
    const end=Math.min(maxTop,page.y+visual+28-room);
    glide(top,900);
    if (end>top+40) tour.read=setTimeout(()=>glide(end,TOUR_HOLD-1500),1100);
    const base='translate('+page.x+'px,'+page.y+'px) scale('+page.scale+')';
    const lift='translate('+page.x+'px,'+(page.y-3)+'px) scale('+(page.scale*1.012)+')';
    tour.animation=page.position.animate([{transform:base},{transform:lift,offset:.5},{transform:base}],{duration:TOUR_HOLD,easing:'ease-in-out'});
    send('tour',{title:page.title.slice(0,100)});
    tour.timer=setTimeout(()=>{ tour.index++; tourStep(); },TOUR_HOLD);
  }
  let resumeTimer=null, focused=false;
  // The highlight a chip tap puts on a page comes off whenever the user, the
  // walk or the host takes over; a running walk keeps its own.
  function releaseFocus() {
    clearTimeout(resumeTimer); resumeTimer=null;
    if (!focused) return;
    focused=false;
    if (tour) return;
    scene.classList.remove('is-touring');
    pages.forEach(item=>item.position.classList.remove('is-touring'));
    send('tour',{title:null});
  }
  // A page the user asked for: the camera goes there and the walk waits.
  function focusPage(route) {
    const target=pages.get(route);
    if (!target || !target.meaningful || !target.revealed || target.position.hidden) return;
    stopTour(); releaseFocus(); tourInterrupted=true; focused=true;
    scene.classList.add('is-touring');
    pages.forEach(item=>item.position.classList.toggle('is-touring',item===target));
    const visual=target.height*target.scale, room=viewport.clientHeight, maxTop=Math.max(0,scene.offsetHeight-room);
    glideTo(Math.min(maxTop,Math.max(0,target.y-24-Math.max(0,(room-visual-24)/2))),700);
    send('tour',{title:target.title.slice(0,100)});
    resumeTimer=setTimeout(()=>{ tourInterrupted=false; releaseFocus(); startTour(); },12000);
  }
  function noteActivity() {
    idleWalk=false;
    clearTimeout(idleTimer);
    if (tour && !finishing) stopTour();
    if (active && !complete && !document.hidden) idleTimer=setTimeout(()=>{ idleWalk=true; startTour(); },IDLE_MS);
  }
  function startTour() {
    if (tour || tourInterrupted || disposed || !(finishing || idleWalk) || complete || !active || document.hidden || media.matches || presenting) return;
    if (!tourPages().length) return;
    clearTimeout(resumeTimer); resumeTimer=null; focused=false;
    tour={index:0,timer:null,read:null,animation:null};
    scene.classList.add('is-touring');
    tourStep();
  }
  function config(data) {
    if (typeof data.active!=='boolean' || typeof data.generating!=='boolean' || typeof data.complete!=='boolean') return;
    const changed=active!==data.active || complete!==data.complete;
    active=data.active;complete=data.complete;
    const wasFinishing=finishing; finishing=data.finishing===true;
    if (complete || !active || (wasFinishing && !finishing)) stopTour();
    if (finishing && !wasFinishing) { tourInterrupted=false; reframe(); }
    if (finishing && !complete && active) setTimeout(startTour,600);
    if (!complete && active) noteActivity();
    if (!complete) completeAt=null;
    waitingText=typeof data.waiting==='string'?data.waiting.slice(0,180):'';
    imageErrorText=typeof data.imageError==='string'?data.imageError.slice(0,180):'';
    if (changed || !active || complete) cancelMotion();
    pages.forEach(page=>{page.polishing=false;page.fadeTimer=null;});
    flush();
  }
  let roster='';
  function receive(event) {
    const data=event.data;
    if (!data || data.v!==1 || data.channel!==channel || typeof data.type!=='string') return;
    if(data.type==='render') {
      if (typeof data.route!=='string' || data.route.length>200 || !/^\/[^\s?#\\]*$/.test(data.route) || typeof data.epoch!=='string' || !/^\d+:\d+$/.test(data.epoch) || !Number.isSafeInteger(data.revision) || data.revision<1 || typeof data.html!=='string' || !data.html.length || data.html.length>MAX_HTML || typeof data.title!=='string' || data.title.length>100 || (!pages.has(data.route) && !pending.has(data.route) && pages.size+pending.size>=24))return;
      const previous=pending.get(data.route)||pages.get(data.route);
      if(previous){const a=previous.epoch.split(':').map(Number),b=data.epoch.split(':').map(Number);if(b[0]<a[0] || (b[0]===a[0] && b[1]<a[1]) || (data.epoch===previous.epoch && data.revision<=previous.revision))return;}
      if(previous && data.epoch!==previous.epoch)cancelMotion();
      pending.set(data.route,data);if(!active || document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;flush();}else if(!frame)frame=requestAnimationFrame(flush);
    } else if(data.type==='assets')addAssets(data.assets);
    else if(data.type==='config')config(data);
    else if(data.type==='focus' && typeof data.route==='string' && data.route.length<=200 && /^\/[^\s?#\\]*$/.test(data.route))focusPage(data.route);
    else if(data.type==='routes' && Array.isArray(data.routes) && data.routes.length<=24){if(data.routes.some(route=>typeof route!=='string'||!/^\/[^\s?#\\]*$/.test(route)||route.length>200))return;const signature=data.routes.slice().sort().join('\n');if(signature===roster)return;roster=signature;const removed=Array.from(pages.keys()).some(route=>!data.routes.includes(route));if(removed)cancelMotion();pages.forEach(page=>{if(!data.routes.includes(page.route))removePage(page);});pending.forEach((_,route)=>{if(!data.routes.includes(route))pending.delete(route);});if(pruneResources(true))pressure=false;emitStatus();if(!presenting)layout(false).then(()=>{advancePresentation();checkCompletion();});}
  }
  function connect(event) {
    if(event.source!==parent || event.origin!==parentOrigin || !event.data || event.data.v!==1 || event.data.channel!==channel || event.data.type!=='connect' || event.ports.length!==1 || port)return;
    port=event.ports[0];window.removeEventListener('message',connect);port.onmessage=receive;port.start();send('ready',{});
  }
  function interruptCamera() {
    tourInterrupted=true;
    cancelCamera();
    stopTour();
    releaseFocus();
    resumeTimer=setTimeout(()=>{ tourInterrupted=false; startTour(); },8000);
    if (presentation!=='returning' && presentation!=='revealing') return;
    cancelMotion();layout(false).then(checkCompletion);
  }
  viewport.addEventListener('wheel',interruptCamera,{passive:true});
  viewport.addEventListener('touchstart',interruptCamera,{passive:true});
  viewport.addEventListener('pointerdown',interruptCamera,{passive:true});
  viewport.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))interruptCamera();});
  window.addEventListener('message',connect);
  window.addEventListener('resize',reframe);
  document.addEventListener('visibilitychange',()=>{cancelMotion();cancelReveals();stopTour();cancelCamera();pages.forEach(page=>{page.polishing=false;page.fadeTimer=null;});if(!document.hidden){flush();setTimeout(startTour,600);}});
  media.addEventListener('change',()=>{cancelMotion();cancelReveals();stopTour();cancelCamera();pages.forEach(page=>{page.polishing=false;page.fadeTimer=null;});flush();setTimeout(startTour,600);});
  document.addEventListener('click',event=>event.preventDefault(),true);
  document.addEventListener('submit',event=>event.preventDefault(),true);
  window.addEventListener('pagehide',()=>{disposed=true;stopTour();cancelCamera();clearTimeout(idleTimer);clearTimeout(resumeTimer);if(homeTimer!==null)clearTimeout(homeTimer);cancelMotion();cancelReveals();pages.forEach(page=>page.observer.disconnect());resources.forEach(asset=>URL.revokeObjectURL(asset.url));resources.clear();if(port)port.close();});
})();
`;
