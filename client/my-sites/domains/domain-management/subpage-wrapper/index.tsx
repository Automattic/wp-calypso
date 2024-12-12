import NavigationHeader from 'calypso/components/navigation-header';
import { getSubPageParams } from './subpages';
import './style.scss';

type SubPageWrapperProps = {
	children: React.ReactNode;
	subPageKey: string;
};

const SubPageWrapper = ( { children, subPageKey }: SubPageWrapperProps ) => {
	const subPageParams = getSubPageParams( subPageKey );

	return subPageParams ? (
		<>
			<NavigationHeader
				navigationItems={ [] }
				title={ subPageParams.title }
				subtitle={ subPageParams.subtitle }
			/>
			<div className="subpage-wrapper">{ children }</div>
		</>
	) : (
		<>{ children }</>
	);
};

export default SubPageWrapper;
