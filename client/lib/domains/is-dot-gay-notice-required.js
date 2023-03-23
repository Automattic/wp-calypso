export function isDotGayNoticeRequired( productSlug, productsList ) {
	const product = productsList[ productSlug ] || {};
	return product?.is_dot_gay_notice_required ?? false;
}
