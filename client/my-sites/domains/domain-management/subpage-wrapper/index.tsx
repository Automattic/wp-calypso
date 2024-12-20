import NavigationHeader from 'calypso/components/navigation-header';
import { domainManagementAllOverview } from 'calypso/my-sites/domains/paths';
import { getSubpageParams } from './subpages';
import './style.scss';

type SubpageWrapperProps = {
	children: React.ReactNode;
	subpageKey: string;
	siteName: string;
	domainName: string;
};

const SubpageWrapper = ( { children, subpageKey, siteName, domainName }: SubpageWrapperProps ) => {
	const subpageParams = getSubpageParams( subpageKey );
	if ( ! subpageParams ) {
		return children;
	}

	const breadcrumbItems = [
		{
			label: domainName,
			href: domainManagementAllOverview( siteName, domainName ),
		},
		{
			label: subpageParams.title,
		},
	];

	return (
		<div className="subpage-wrapper">
			<NavigationHeader
				navigationItems={ breadcrumbItems }
				title={ subpageParams.title }
				subtitle={ subpageParams.subtitle }
				alwaysShowTitle
				className="subpage-wrapper__header"
			/>
			<div className="subpage-wrapper__content">{ children }</div>
		</div>
	);
};

export default SubpageWrapper;
