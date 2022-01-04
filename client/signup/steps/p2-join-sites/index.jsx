import { useTranslate, numberFormat } from 'i18n-calypso';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import './style.scss';

function P2JoinSites( { flowName, positionInFlow, stepName } ) {
	const translate = useTranslate();

	/* TODO
	const handleCreateSiteClick = () => {
		submitSignupStep( { stepName } );

		goToNextStep();
	};
	*/

	const renderSiteIconImage = ( siteIconURL ) => {
		return (
			<img
				className="p2-join-sites__site-icon-image"
				src={ siteIconURL }
				alt=""
				width={ 60 }
				height={ 60 }
			/>
		);
	};

	const renderSiteIconPlaceholder = ( siteName ) => {
		return <div className="p2-join-sites__site-icon-placeholder">{ siteName.charAt( 0 ) }</div>;
	};

	const renderSiteIcon = ( site ) => {
		return (
			<div className="p2-join-sites__site-icon">
				{ site.site_icon
					? renderSiteIconImage( site.site_icon )
					: renderSiteIconPlaceholder( site.name ) }
			</div>
		);
	};

	const renderSite = ( site, index ) => {
		return (
			<div className="p2-join-sites__site" key={ index }>
				<div className="p2-join-sites__site-icon">{ renderSiteIcon( site ) }</div>
				<div className="p2-join-sites__site-name">{ site.name }</div>
				<div className="p2-join-sites__site-details">
					<div>
						{ translate( '%(userCount)s member', '%(userCount)s members', {
							count: site.user_count,
							args: {
								userCount: numberFormat( site.user_count ),
							},
						} ) }
					</div>
					<div>
						{ translate( '%(p2Count)s P2', '%(p2Count)s P2s', {
							count: site.user_count,
							args: {
								p2Count: numberFormat( site.p2_count ),
							},
						} ) }
					</div>
				</div>
			</div>
		);
	};

	/**
	 * TODO This list of sites that the user can join on their own will come from
	 * an endpoint that, in turn, queries a database table that stores
	 * workspace-to-email domain mappings,
	 *
	 * e.g.
	 * (site id:int, email domain:string, ...)
	 * 188873359, 'automattic.com',...
	 * 188873359, 'a8c.com',...
	 */

	// As proof-of-concept, we hardcode this for now.
	const sitesUserCanJoin = [
		{
			site_id: 189762656,
			url: 'https://lighthouseworkspacehub.wordpress.com/',
			name: 'Private Lighthouse',
			user_count: 54,
			p2_count: 8,
			is_member: false,
		},
		{
			siteId: 192942363,
			url: 'https://annemirasolp2testhub.wordpress.com/',
			name: "Anne's Test Hub",
			user_count: 1,
			p2_count: 8,
			is_member: false,
		},
	];

	/** END TODO */

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Welcome to P2!' ) }
			subHeaderText={
				sitesUserCanJoin.length > 0
					? translate( 'Great news! You can join some workspaces right away.' )
					: translate( 'A better way of working' )
			}
		>
			<div className="p2-join-sites">
				<div className="p2-join-sites__site-list">
					{ sitesUserCanJoin.map( ( site, index ) => renderSite( site, index ) ) }
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2JoinSites;
