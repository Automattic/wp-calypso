import { Button, Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useSitePanel } from '../../hooks/use-site-panel';

export function SitePanelToggle() {
	const panel = useSitePanel();
	return panel.items.length > 0 || panel.isListError ? (
		<Button
			className="agents-manager-fullscreen__panel-toggle"
			variant="secondary"
			onClick={ () => ( panel.isOpen ? panel.close() : void panel.open() ) }
			aria-expanded={ panel.isOpen }
			aria-controls="agents-manager-site-panel-card"
		>
			{ sprintf(
				/* translators: %s: number of referenced pages. */
				__( 'Referenced pages (%s)', __i18n_text_domain__ ),
				new Intl.NumberFormat().format( panel.items.length )
			) }
		</Button>
	) : null;
}

export function SitePanelCard() {
	const panel = useSitePanel();
	if ( ! panel.isOpen ) {
		return null;
	}
	return (
		<aside
			id="agents-manager-site-panel-card"
			className="agents-manager-fullscreen__panel-card"
			aria-label={ __( 'Referenced pages', __i18n_text_domain__ ) }
		>
			<header className="agents-manager-fullscreen__panel-header">
				<strong>{ panel.title || __( 'Referenced pages', __i18n_text_domain__ ) }</strong>
				{ panel.externalUrl && (
					<Button href={ panel.externalUrl } target="_blank" rel="noopener noreferrer">
						{ __( 'Open in new tab', __i18n_text_domain__ ) }
					</Button>
				) }
				<Button
					icon={ close }
					label={ __( 'Close site panel', __i18n_text_domain__ ) }
					onClick={ panel.close }
				/>
			</header>
			<div className="agents-manager-fullscreen__panel-list">
				{ panel.isListError && (
					<p role="alert">
						{ __( 'Could not load referenced pages. Please try again.', __i18n_text_domain__ ) }
					</p>
				) }
				{ panel.items.map( ( item ) => (
					<Button key={ item.url } onClick={ () => void panel.open( item ) }>
						{ item.title }
					</Button>
				) ) }
			</div>
			{ panel.isLoading && <Spinner /> }
			{ panel.error && <p role="alert">{ panel.error }</p> }
		</aside>
	);
}

export function SitePanel() {
	const panel = useSitePanel();
	if ( ! panel.isOpen ) {
		return null;
	}
	return (
		<aside
			id="agents-manager-site-panel"
			className="agents-manager-fullscreen__site-panel"
			aria-label={ __( 'Site panel', __i18n_text_domain__ ) }
		>
			{ panel.url && (
				<iframe
					ref={ panel.setFrame }
					src={ panel.url }
					title={ __( 'Site editor preview', __i18n_text_domain__ ) }
					className="agents-manager-fullscreen__panel-frame"
				/>
			) }
		</aside>
	);
}
