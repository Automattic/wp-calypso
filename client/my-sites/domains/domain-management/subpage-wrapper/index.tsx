import NavigationHeader from 'calypso/components/navigation-header';
import { getSubpageParams } from './subpages';
import './style.scss';

type SubpageWrapperProps = {
	children: React.ReactNode;
	selectedDomainName: string;
	selectedSiteSlug: string;
	subpageKey: string;
};

const SubpageWrapper = ( {
	children,
	selectedDomainName,
	selectedSiteSlug,
	subpageKey,
}: SubpageWrapperProps ) => {
	const { CustomHeader, title, subtitle } = getSubpageParams( subpageKey ) || {};

	if ( CustomHeader ) {
		return (
			<div className="subpage-wrapper">
				<CustomHeader
					selectedDomainName={ selectedDomainName }
					selectedSiteSlug={ selectedSiteSlug }
				/>
				<div className="subpage-wrapper__content">{ children }</div>
			</div>
		);
	}

	if ( title ) {
		return (
			<>
				<NavigationHeader
					className="subpage-wrapper__header"
					title={ title }
					subtitle={ subtitle }
				/>
				<div className="subpage-wrapper__content">{ children }</div>
			</>
		);
	}

	return <>{ children }</>;
};

export default SubpageWrapper;
