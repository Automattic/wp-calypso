/**
 * External dependencies
 */
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { Button, PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FontPairingsPanel from './font-pairings-panel';
import FontSelectionPanel from './font-selection-panel';
import { GlobalStylesIcon } from './icon';
import { FONT_BASE, FONT_HEADINGS } from './constants';

const ANY_PROPERTY = 'ANY_PROPERTY';

const isFor = ( filterProperty ) => ( option ) =>
	option.prop === ANY_PROPERTY || option.prop === filterProperty;

const toOption = ( font ) => {
	if ( typeof font === 'object' ) {
		const { label, value, prop = ANY_PROPERTY } = font;
		return { label, value, prop };
	}
	return { label: font, value: font, prop: ANY_PROPERTY };
};
const isNotNull = ( option ) => option.value !== null && option.label !== null;

const toOptions = ( options, filterProperty ) =>
	! options ? [] : options.map( toOption ).filter( isNotNull ).filter( isFor( filterProperty ) );

const PanelActionButtons = ( {
	hasLocalChanges,
	resetAction,
	publishAction,
	className = null,
} ) => (
	<div className={ className }>
		<Button disabled={ ! hasLocalChanges } isDefault onClick={ resetAction }>
			{ __( 'Reset', 'full-site-editing' ) }
		</Button>
		<Button
			className={ 'global-styles-sidebar__publish-button' }
			disabled={ ! hasLocalChanges }
			isPrimary
			onClick={ publishAction }
		>
			{ __( 'Publish', 'full-site-editing' ) }
		</Button>
	</div>
);

export default ( {
	fontHeadings,
	fontHeadingsDefault,
	fontBase,
	fontBaseDefault,
	fontPairings,
	fontOptions,
	siteName,
	publishOptions,
	updateOptions,
	hasLocalChanges,
	resetLocalChanges,
} ) => {
	const publish = () =>
		publishOptions( {
			[ FONT_BASE ]: fontBase,
			[ FONT_HEADINGS ]: fontHeadings,
		} );
	return (
		<>
			<PluginSidebarMoreMenuItem icon={ <GlobalStylesIcon /> } target="global-styles">
				{ __( 'Global Styles', 'full-site-editing' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				icon={ <GlobalStylesIcon /> }
				name={ 'global-styles' }
				title={ __( 'Global Styles', 'full-site-editing' ) }
				className="global-styles-sidebar"
			>
				<PanelBody>
					<p>
						{
							/* translators: %s: Name of site. */
							sprintf( __( 'You are customizing %s.', 'full-site-editing' ), siteName )
						}
					</p>
					<p>
						{ __(
							'Any change you make here will apply to the entire website.',
							'full-site-editing'
						) }
					</p>
					{ hasLocalChanges ? (
						<div>
							<p>
								<em>{ __( 'You have unsaved changes.', 'full-site-editing' ) }</em>
							</p>
							<PanelActionButtons
								hasLocalChanges={ hasLocalChanges }
								publishAction={ publish }
								resetAction={ resetLocalChanges }
							/>
						</div>
					) : null }
				</PanelBody>
				<PanelBody title={ __( 'Font Selection', 'full-site-editing' ) }>
					<FontSelectionPanel
						fontBase={ fontBase }
						fontBaseDefault={ fontBaseDefault }
						fontHeadings={ fontHeadings }
						fontHeadingsDefault={ fontHeadingsDefault }
						fontBaseOptions={ toOptions( fontOptions, FONT_BASE ) }
						fontHeadingsOptions={ toOptions( fontOptions, FONT_HEADINGS ) }
						updateBaseFont={ ( value ) => updateOptions( { [ FONT_BASE ]: value } ) }
						updateHeadingsFont={ ( value ) => updateOptions( { [ FONT_HEADINGS ]: value } ) }
					/>
					<FontPairingsPanel
						fontHeadings={ fontHeadings }
						fontBase={ fontBase }
						fontPairings={ fontPairings }
						update={ ( { headings, base } ) =>
							updateOptions( { [ FONT_HEADINGS ]: headings, [ FONT_BASE ]: base } )
						}
					/>
				</PanelBody>
				<PanelBody>
					{ hasLocalChanges ? (
						<p>
							<em>{ __( 'You have unsaved changes.', 'full-site-editing' ) }</em>
						</p>
					) : null }
					<PanelActionButtons
						hasLocalChanges={ hasLocalChanges }
						publishAction={ publish }
						resetAction={ resetLocalChanges }
						className={ 'global-styles-sidebar__panel-action-buttons' }
					/>
				</PanelBody>
			</PluginSidebar>
		</>
	);
};
