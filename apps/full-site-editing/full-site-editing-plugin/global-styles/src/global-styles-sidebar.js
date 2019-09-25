/**
 * External dependencies
 */
import { PluginSidebar } from '@wordpress/edit-post';
import { Button, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import FontPairingsPanel from './font-pairings-panel';
import FontSelectionPanel from './font-selection-panel';
import { GlobalStylesIcon } from './icon';
import { FONT_BASE, FONT_HEADINGS } from './constants';

const ANY_PROPERTY = 'ANY_PROPERTY';

const isFor = filterProperty => option =>
	option.prop === ANY_PROPERTY || option.prop === filterProperty;

const toOption = font => {
	if ( typeof font === 'object' ) {
		const { label, value, prop = ANY_PROPERTY } = font;
		return { label, value, prop };
	}
	return { label: font, value: font, prop: ANY_PROPERTY };
};
const isNotNull = option => option.value !== null && option.label !== null;

const toOptions = ( options, filterProperty ) =>
	! options
		? []
		: options
				.map( toOption )
				.filter( isNotNull )
				.filter( isFor( filterProperty ) );

export default ( {
	fontHeadings,
	fontHeadingsDefault,
	fontBase,
	fontBaseDefault,
	fontPairings,
	fontOptions,
	siteName,
	updateOptions,
	hasLocalChanges,
	resetLocalChanges,
} ) => {
	const publish = () =>
		updateOptions( {
			[ FONT_BASE ]: fontBase,
			[ FONT_HEADINGS ]: fontHeadings,
		} );
	return (
		<PluginSidebar
			icon={ <GlobalStylesIcon /> }
			name={ 'global-styles' }
			title={ __( 'Global Styles' ) }
			className="global-styles-sidebar"
		>
			<PanelBody>
				<p>
					{ __( 'You are customizing ' ) }
					<strong>{ siteName }</strong>.
				</p>
				<p>{ __( 'Any change you make here will apply to the entire website.' ) }</p>
			</PanelBody>
			<PanelBody title={ __( 'Font Selection' ) }>
				<FontSelectionPanel
					fontBase={ fontBase }
					fontBaseDefault={ fontBaseDefault }
					fontHeadings={ fontHeadings }
					fontHeadingsDefault={ fontHeadingsDefault }
					fontBaseOptions={ toOptions( fontOptions, FONT_BASE ) }
					fontHeadingsOptions={ toOptions( fontOptions, FONT_HEADINGS ) }
					updateBaseFont={ value => updateOptions( { [ FONT_BASE ]: value }, false ) }
					updateHeadingsFont={ value => updateOptions( { [ FONT_HEADINGS ]: value }, false ) }
				/>
				<FontPairingsPanel
					fontHeadings={ fontHeadings }
					fontBase={ fontBase }
					fontPairings={ fontPairings }
					update={ ( { headings, base } ) =>
						updateOptions( { [ FONT_HEADINGS ]: headings, [ FONT_BASE ]: base }, false )
					}
				/>
			</PanelBody>
			<PanelBody>
				{ hasLocalChanges ? (
					<p>
						<em>{ __( 'You have unsaved changes.' ) }</em>
					</p>
				) : null }
				<div className="global-styles-sidebar__publish-buttons">
					<Button disabled={ ! hasLocalChanges } isDefault onClick={ resetLocalChanges }>
						{ __( 'Reset' ) }
					</Button>
					<Button
						disabled={ ! hasLocalChanges }
						style={ { marginLeft: '1em' } }
						isPrimary
						onClick={ publish }
					>
						{ __( 'Publish' ) }
					</Button>
				</div>
			</PanelBody>
		</PluginSidebar>
	);
};
