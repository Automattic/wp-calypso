import NavigationHeader from 'calypso/components/navigation-header';
import { getSubpageParams } from './subpages';
import './style.scss';

type SubpageWrapperProps = {
	children: React.ReactNode;
	subpageKey: string;
};

const SubpageWrapper = ( { children, subpageKey }: SubpageWrapperProps ) => {
	const subpageParams = getSubpageParams( subpageKey );

	return subpageParams ? (
		<>
			<NavigationHeader
				navigationItems={ [] }
				title={ subpageParams.title }
				subtitle={ subpageParams.subtitle }
			/>
			<div className="subpage-wrapper">{ children }</div>
		</>
	) : (
		<>{ children }</>
	);
};

export default SubpageWrapper;
