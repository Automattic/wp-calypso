import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_INSTALL_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { PatternAssemblerCta, BLANK_CANVAS_DESIGN } from '@automattic/design-picker';
import { Icon, addTemplate, brush, cloudUpload } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import { isEmpty, times } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Theme from 'calypso/components/theme';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { DEFAULT_THEME_QUERY } from 'calypso/state/themes/constants';
import { getThemeSignupUrl } from 'calypso/state/themes/selectors';
import { getThemesBookmark } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const noop = () => {};

export const ThemesList = ( props ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );

	const fetchNextPage = useCallback(
		( options ) => {
			props.fetchNextPage( options );
		},
		[ props.fetchNextPage ]
	);

	const matchingWpOrgThemes = useMemo(
		() =>
			props.wpOrgThemes?.filter(
				( wpOrgTheme ) =>
					wpOrgTheme?.name?.toLowerCase() === props.searchTerm.toLowerCase() ||
					wpOrgTheme?.id?.toLowerCase() === props.searchTerm.toLowerCase()
			) || [],
		[ props.wpOrgThemes, props.searchTerm ]
	);

	if ( ! props.loading && props.themes.length === 0 ) {
		if ( matchingWpOrgThemes.length ) {
			return <WPOrgMatchingThemes matchingThemes={ matchingWpOrgThemes } { ...props } />;
		}

		return <Empty translate={ props.translate } />;
	}

	return (
		<>
			<div className="themes-list">
				{ props.themes.map( ( theme, index ) => (
					<ThemeBlock key={ 'theme-block' + index } theme={ theme } index={ index } { ...props } />
				) ) }
				{ /* The Pattern Assembler CTA will display on the fourth row and the behavior is controlled by CSS */ }
				{ isEnabled( 'pattern-assembler/logged-out-showcase' ) &&
					props.themes.length > 0 &&
					! isLoggedIn && (
						<PatternAssemblerCta
							onButtonClick={ () =>
								window.location.assign(
									`/start/with-theme?ref=calypshowcase&theme=${ BLANK_CANVAS_DESIGN.slug }`
								)
							}
						/>
					) }
				{ props.loading && <LoadingPlaceholders placeholderCount={ props.placeholderCount } /> }
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			</div>
			<Footer translate={ props.translate } />
		</>
	);
};

ThemesList.propTypes = {
	themes: PropTypes.array.isRequired,
	wpOrgThemes: PropTypes.array,
	loading: PropTypes.bool.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	fetchNextPage: PropTypes.func.isRequired,
	getButtonOptions: PropTypes.func,
	getScreenshotUrl: PropTypes.func,
	onScreenshotClick: PropTypes.func.isRequired,
	onStyleVariationClick: PropTypes.func,
	onMoreButtonClick: PropTypes.func,
	onMoreButtonItemClick: PropTypes.func,
	getActionLabel: PropTypes.func,
	isActive: PropTypes.func,
	getPrice: PropTypes.func,
	isInstalling: PropTypes.func,
	// i18n function provided by localize()
	translate: PropTypes.func,
	placeholderCount: PropTypes.number,
	bookmarkRef: PropTypes.oneOfType( [
		PropTypes.func,
		PropTypes.shape( { current: PropTypes.any } ),
	] ),
	siteId: PropTypes.number,
	searchTerm: PropTypes.string,
};

ThemesList.defaultProps = {
	loading: false,
	searchTerm: '',
	themes: [],
	wpOrgThemes: [],
	recordTracksEvent: noop,
	fetchNextPage: noop,
	placeholderCount: DEFAULT_THEME_QUERY.number,
	optionsGenerator: () => [],
	getActionLabel: () => '',
	isActive: () => false,
	getPrice: () => '',
	isInstalling: () => false,
};

function ThemeBlock( props ) {
	const { theme, index } = props;
	if ( isEmpty( theme ) ) {
		return null;
	}
	// Decide if we should pass ref for bookmark.
	const { themesBookmark, siteId } = props;
	const bookmarkRef = themesBookmark === theme.id ? props.bookmarkRef : null;

	return (
		<Theme
			key={ 'theme-' + theme.id }
			buttonContents={ props.getButtonOptions( theme.id ) }
			screenshotClickUrl={ props.getScreenshotUrl && props.getScreenshotUrl( theme.id ) }
			onScreenshotClick={ props.onScreenshotClick }
			onStyleVariationClick={ props.onStyleVariationClick }
			onMoreButtonClick={ props.onMoreButtonClick }
			onMoreButtonItemClick={ props.onMoreButtonItemClick }
			actionLabel={ props.getActionLabel( theme.id ) }
			index={ index }
			theme={ theme }
			active={ props.isActive( theme.id ) }
			price={ props.getPrice( theme.id ) }
			installing={ props.isInstalling( theme.id ) }
			upsellUrl={ props.upsellUrl }
			bookmarkRef={ bookmarkRef }
			siteId={ siteId }
			softLaunched={ theme.soft_launched }
		/>
	);
}

function Footer( props ) {
	const { translate } = props;
	const selectedSite = useSelector( getSelectedSite );
	const canInstallTheme = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, FEATURE_INSTALL_THEMES )
	);
	const blankCanvasSignupUrl = useSelector( ( state ) =>
		getThemeSignupUrl( state, BLANK_CANVAS_DESIGN.slug )
	);
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, selectedSite?.ID ) );

	let uploadThemeDescription;
	let uploadThemeUrl;
	let uploadThemeButton;
	if ( ! selectedSite ) {
		uploadThemeDescription = translate(
			'With a Business plan, you can upload and install third-party themes to your site, including themes from WordPress.org, and even themes you have custom-made for your website.'
		);
		uploadThemeUrl = '/start/business';
		uploadThemeButton = translate( 'Get started' );
	} else if ( canInstallTheme ) {
		uploadThemeDescription = translate(
			'You can upload third-party themes to your site, including themes from WordPress.org, and even themes you have custom-made for your website.'
		);
		uploadThemeUrl = isAtomic
			? `https://${ selectedSite.slug }/wp-admin/theme-install.php`
			: `/themes/upload/${ selectedSite.slug }`;
		uploadThemeButton = translate( 'Upload theme' );
	} else {
		uploadThemeDescription = translate(
			'Upgrade to a Business plan to upload and install third-party themes to your site, including themes from WordPress.org, and even themes you have custom-made for your website.'
		);
		uploadThemeUrl = `/checkout/${ selectedSite.slug }/business?redirect_to=/themes/upload/${ selectedSite.slug }`;
		uploadThemeButton = translate( 'Upgrade your plan' );
	}

	return (
		<div className="themes-list__footer">
			<div className="themes-list__footer-heading">
				{ translate( "Can't find what you're looking for?" ) }
			</div>
			<div className="themes-list__footer-subheading">
				{ translate( 'Here are a few more options:' ) }
			</div>
			<div className="themes-list__footer-action">
				<Icon className="themes-list__footer-action-icon" icon={ addTemplate } size={ 28 } />
				<div className="themes-list__footer-action-content">
					<div className="themes-list__footer-action-text">
						<div className="themes-list__footer-action-title">
							{ translate( 'Create your own theme from scratch' ) }
						</div>
						<div className="themes-list__footer-action-description">
							{ selectedSite
								? translate( 'Jump right into the editor to design your homepage from scratch.' )
								: translate(
										'Start with a blank canvas and design your own homepage using our library of patterns.'
								  ) }
						</div>
					</div>
					<Button
						primary
						className="themes-list__footer-action-button"
						href={ selectedSite ? `/site-editor/${ selectedSite.slug }` : blankCanvasSignupUrl }
					>
						{ selectedSite ? translate( 'Open the editor' ) : translate( 'Start designing' ) }
					</Button>
				</div>
			</div>
			<div className="themes-list__footer-action">
				<Icon className="themes-list__footer-action-icon" icon={ brush } size={ 28 } />
				<div className="themes-list__footer-action-content">
					<div className="themes-list__footer-action-text">
						<div className="themes-list__footer-action-title">
							{ translate( 'Hire our team of experts to design one for you', {
								comment:
									'"One" means a theme in this context (i.e. "Hire our team of experts to design a theme for you")',
							} ) }
						</div>
						<div className="themes-list__footer-action-description">
							{ translate(
								'A WordPress.com professional will create layouts for up to 5 pages of your site.'
							) }
						</div>
					</div>
					<Button
						className="themes-list__footer-action-button"
						href="https://wordpress.com/do-it-for-me/"
					>
						{ translate( 'Hire an expert' ) }
					</Button>
				</div>
			</div>
			<div className="themes-list__footer-action">
				<Icon className="themes-list__footer-action-icon" icon={ cloudUpload } size={ 28 } />
				<div className="themes-list__footer-action-content">
					<div className="themes-list__footer-action-text">
						<div className="themes-list__footer-action-title">
							{ translate( 'Upload a theme' ) }
						</div>
						<div className="themes-list__footer-action-description">{ uploadThemeDescription }</div>
					</div>
					<Button className="themes-list__footer-action-button" href={ uploadThemeUrl }>
						{ uploadThemeButton }
					</Button>
				</div>
			</div>
		</div>
	);
}

function Empty( props ) {
	const { translate } = props;

	return (
		<>
			<div className="themes-list__empty-search-text">
				{ translate( 'No themes match your search' ) }
			</div>
			<Footer translate={ translate } />
		</>
	);
}

function WPOrgMatchingThemes( props ) {
	const { matchingThemes } = props;

	const onWPOrgCardClick = useCallback(
		( theme ) => {
			props.recordTracksEvent( 'calypso_themeshowcase_search_empty_wp_org_card_click', {
				site_plan: props.selectedSite?.plan?.product_slug,
				theme_id: theme?.id,
			} );
		},
		[ props.recordTracksEvent, props.selectedSite ]
	);

	return (
		<div>
			<div className="themes-list">
				{ matchingThemes.map( ( theme, index ) => (
					<div
						onClick={ () => onWPOrgCardClick( theme ) }
						key={ 'theme-block' + index }
						role="button"
						tabIndex={ 0 }
						onKeyUp={ () => onWPOrgCardClick( theme ) }
					>
						<ThemeBlock theme={ theme } index={ index } { ...props } />
					</div>
				) ) }
			</div>
			<Footer translate={ props.translate } />
		</div>
	);
}

function LoadingPlaceholders( { placeholderCount } ) {
	return times( placeholderCount, function ( i ) {
		return (
			<Theme
				key={ 'placeholder-' + i }
				theme={ { id: 'placeholder-' + i, name: 'Loading…' } }
				isPlaceholder={ true }
			/>
		);
	} );
}

const mapStateToProps = ( state ) => ( {
	themesBookmark: getThemesBookmark( state ),
} );

export default connect( mapStateToProps )( localize( ThemesList ) );
