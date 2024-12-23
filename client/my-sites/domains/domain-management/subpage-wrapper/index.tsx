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
		<div className="subpage-wrapper">
			<NavigationHeader
				navigationItems={ [] }
				title={ subpageParams.title }
				subtitle={ subpageParams.subtitle }
				className="subpage-wrapper__header"
			/>
			<div className="subpage-wrapper__content">{ children }</div>
		</div>
	) : (
		<>{ children }</>
	);
};

export default SubpageWrapper;
