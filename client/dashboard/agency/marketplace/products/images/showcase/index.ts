/**
 * Featured drawings, drawn in Figma (MSD - Information Architecture,
 * "Marketplace Graphics", Product drawings): one per job category, exported
 * once per maker (woo, jetpack, and neutral for makers outside Automattic),
 * plus a few products with their own. Named <drawing>-<maker>.svg.
 */
import aiAnswerJetpack from './ai-answer-jetpack.svg';
import giftCardsWoo from './gift-cards-woo.svg';
import kitJetpack from './kit-jetpack.svg';
import kitNeutral from './kit-neutral.svg';
import kitWoo from './kit-woo.svg';
import ordersJetpack from './orders-jetpack.svg';
import ordersNeutral from './orders-neutral.svg';
import ordersWoo from './orders-woo.svg';
import paymentJetpack from './payment-jetpack.svg';
import paymentNeutral from './payment-neutral.svg';
import paymentWoo from './payment-woo.svg';
import pointsJetpack from './points-jetpack.svg';
import pointsNeutral from './points-neutral.svg';
import pointsWoo from './points-woo.svg';
import productJetpack from './product-jetpack.svg';
import productNeutral from './product-neutral.svg';
import productWoo from './product-woo.svg';
import ratesJetpack from './rates-jetpack.svg';
import ratesNeutral from './rates-neutral.svg';
import ratesWoo from './rates-woo.svg';
import scanJetpack from './scan-jetpack.svg';
import scanNeutral from './scan-neutral.svg';
import scanWoo from './scan-woo.svg';
import socialJetpack from './social-jetpack.svg';
import socialNeutral from './social-neutral.svg';
import socialWoo from './social-woo.svg';
import speedJetpack from './speed-jetpack.svg';
import speedNeutral from './speed-neutral.svg';
import speedWoo from './speed-woo.svg';
import statsJetpack from './stats-jetpack.svg';
import statsNeutral from './stats-neutral.svg';
import statsWoo from './stats-woo.svg';
import storageJetpack from './storage-jetpack.svg';
import trackingJetpack from './tracking-jetpack.svg';
import trackingNeutral from './tracking-neutral.svg';
import trackingWoo from './tracking-woo.svg';
import videoPlayerJetpack from './video-player-jetpack.svg';

export const PRODUCT_IMAGES: Record< string, string > = {
	'ai-answer-jetpack': aiAnswerJetpack,
	'gift-cards-woo': giftCardsWoo,
	'kit-jetpack': kitJetpack,
	'kit-neutral': kitNeutral,
	'kit-woo': kitWoo,
	'orders-jetpack': ordersJetpack,
	'orders-neutral': ordersNeutral,
	'orders-woo': ordersWoo,
	'payment-jetpack': paymentJetpack,
	'payment-neutral': paymentNeutral,
	'payment-woo': paymentWoo,
	'points-jetpack': pointsJetpack,
	'points-neutral': pointsNeutral,
	'points-woo': pointsWoo,
	'product-jetpack': productJetpack,
	'product-neutral': productNeutral,
	'product-woo': productWoo,
	'rates-jetpack': ratesJetpack,
	'rates-neutral': ratesNeutral,
	'rates-woo': ratesWoo,
	'scan-jetpack': scanJetpack,
	'scan-neutral': scanNeutral,
	'scan-woo': scanWoo,
	'social-jetpack': socialJetpack,
	'social-neutral': socialNeutral,
	'social-woo': socialWoo,
	'speed-jetpack': speedJetpack,
	'speed-neutral': speedNeutral,
	'speed-woo': speedWoo,
	'stats-jetpack': statsJetpack,
	'stats-neutral': statsNeutral,
	'stats-woo': statsWoo,
	'storage-jetpack': storageJetpack,
	'tracking-jetpack': trackingJetpack,
	'tracking-neutral': trackingNeutral,
	'tracking-woo': trackingWoo,
	'video-player-jetpack': videoPlayerJetpack,
};
