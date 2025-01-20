import clsx from 'clsx';
import NavigationHeader from 'calypso/components/navigation-header';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { domainManagementAllOverview } from 'calypso/my-sites/domains/paths';
import { getSubpageParams } from './subpages';
import './style.scss';

type SubpageWrapperProps = {
	children: React.ReactNode;
	subpageKey: string;
	siteName: string;
	domainName: string;
	inSiteContext?: boolean;
};

const SubpageWrapper = ( {
	children,
	subpageKey,
	siteName,
	domainName,
	inSiteContext,
}: SubpageWrapperProps ) => {
	const { CustomHeader, title, subtitle, context } = getSubpageParams( subpageKey ) || {};

	if ( CustomHeader ) {
		return (
			<div className={ clsx( 'subpage-wrapper', `subpage-wrapper--${ subpageKey }` ) }>
				<BodySectionCssClass bodyClass={ [ 'is-domain-in-site-context' ] } />
				<CustomHeader
					selectedDomainName={ domainName }
					selectedSiteSlug={ siteName }
					context={ context }
					inSiteContext={ inSiteContext }
				/>
				<div className="subpage-wrapper__content">{ children }</div>
			</div>
		);
	}

	if ( title ) {
		const breadcrumbItems = [
			{
				label: domainName,
				href: domainManagementAllOverview( siteName, domainName ),
			},
			{
				label: title as string,
			},
		];

		return (
			<div className={ clsx( 'subpage-wrapper', `subpage-wrapper--${ subpageKey }` ) }>
				<BodySectionCssClass bodyClass={ [ 'is-domain-in-site-context' ] } />
				<NavigationHeader
					className="subpage-wrapper__header"
					navigationItems={ breadcrumbItems }
					title={ title }
					subtitle={ subtitle }
					alwaysShowTitle
				/>
				<div className="subpage-wrapper__content">{ children }</div>
			</div>
		);
	}

	return children;
};

export default SubpageWrapper;
