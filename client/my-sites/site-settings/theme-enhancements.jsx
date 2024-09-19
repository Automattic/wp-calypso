import { Card, FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { localize, useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getCustomizerUrl } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

function ThemeEnhancements( {
	isAtomic,
	siteIsJetpack,
	handleAutosavingToggle,
	handleAutosavingRadio,
	isSavingSettings,
	isRequestingSettings,
	fields,
	customizeUrl,
	siteId,
	isFSEActive,
	isFSEActiveLoading,
} ) {
	const isFormPending = isRequestingSettings || isSavingSettings;
	const translate = useTranslate();
	const blockedByFooter = 'footer' === get( fields, 'infinite_scroll_blocked' );
	const name = 'infinite_scroll';

	function RadioOptions() {
		const options = [
			{ value: 'default', label: translate( 'Load more posts using the default theme behavior' ) },
			{ value: 'button', label: translate( 'Load more posts in page with a button' ) },
			{ value: 'scroll', label: translate( 'Load more posts as the reader scrolls down' ) },
		];
		return (
			<>
				<br />
				{ options.map( ( option ) => {
					const { value, label } = option;
					return (
						<FormLabel key={ value }>
							<FormRadio
								name={ name }
								value={ value }
								checked={ value === fields[ name ] }
								onChange={ handleAutosavingRadio( name, value ) }
								disabled={ isFormPending }
								label={ label }
							/>
						</FormLabel>
					);
				} ) }
				<br />
			</>
		);
	}

	return (
		<div>
			<SettingsSectionHeader title={ translate( 'Theme enhancements' ) } />

			{ siteIsJetpack ? (
				<Card>
					<FormLegend>{ translate( 'Infinite Scroll' ) }</FormLegend>
					<SupportInfo
						text={ translate(
							'Loads the next posts automatically when the reader approaches the bottom of the page.'
						) }
						link={
							isAtomic
								? localizeUrl( 'https://wordpress.com/support/infinite-scroll/' )
								: 'https://jetpack.com/support/infinite-scroll/'
						}
						privacyLink={ ! isAtomic }
					/>
					<FormSettingExplanation>
						{ translate(
							'Create a smooth, uninterrupted reading experience by loading more content as visitors scroll to the bottom of your archive pages.'
						) }
					</FormSettingExplanation>
					<RadioOptions />
					{ ! isFSEActiveLoading && ! isFSEActive && (
						<>
							<hr />
							<SupportInfo
								text={ translate(
									"Adds names for CSS preprocessor use, disabling the theme's CSS, or custom image width."
								) }
								link={
									isAtomic
										? localizeUrl( 'https://wordpress.com/support/editing-css/' )
										: 'https://jetpack.com/support/custom-css/'
								}
								privacyLink={ ! isAtomic }
							/>
							<JetpackModuleToggle
								siteId={ siteId }
								moduleSlug="custom-css"
								label={ translate( 'Enhance CSS customization panel' ) }
								disabled={ isFormPending }
							/>
						</>
					) }
				</Card>
			) : (
				<Card>
					<FormLegend>{ translate( 'Infinite scroll' ) }</FormLegend>
					<SupportInfo
						text={ translate( 'Control how additional posts are loaded.' ) }
						link={ localizeUrl( 'https://wordpress.com/support/infinite-scroll/' ) }
						privacyLink={ false }
					/>
					<ToggleControl
						checked={ !! fields[ name ] }
						disabled={ isFormPending || blockedByFooter }
						onChange={ handleAutosavingToggle( name ) }
						label={ translate(
							'Load posts as you scroll. Disable to show a clickable button to load posts.'
						) }
					/>
					{ blockedByFooter && (
						<FormSettingExplanation isIndented>
							{ translate(
								'Your site has a "footer" widget enabled so buttons will always be used. {{link}}Customize your site{{/link}}',
								{
									components: {
										link: <a href={ customizeUrl } />,
									},
								}
							) }
						</FormSettingExplanation>
					) }
				</Card>
			) }
		</div>
	);
}

ThemeEnhancements.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

ThemeEnhancements.propTypes = {
	isAtomic: PropTypes.bool,
	siteIsJetpack: PropTypes.bool,
	onSubmitForm: PropTypes.func.isRequired,
	handleAutosavingToggle: PropTypes.func.isRequired,
	handleAutosavingRadio: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
	site: PropTypes.object,
};

const ConnectedThemeEnhancements = connect( ( state ) => {
	const site = getSelectedSite( state );
	const selectedSiteId = get( site, 'ID' );

	return {
		customizeUrl: getCustomizerUrl( state, selectedSiteId ),
		selectedSiteId,
	};
} )( localize( ThemeEnhancements ) );

export default withIsFSEActive( ConnectedThemeEnhancements );
