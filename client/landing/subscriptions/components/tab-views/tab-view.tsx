import { Spinner } from '@wordpress/components';
import { Notice, NoticeType } from '../notice';
import './styles.scss';

type TabViewProps = {
	children: React.ReactNode;
	errorMessage?: string;
	isLoading?: boolean;
};

const TabView = ( { children, errorMessage, isLoading = false }: TabViewProps ) => {
	if ( errorMessage ) {
		return <Notice type={ NoticeType.Error }>{ errorMessage }</Notice>;
	}

	if ( isLoading ) {
		return (
			<div className="loading-container">
				<Spinner />
			</div>
		);
	}

	return <div className="tab-view">{ children }</div>;
};

export default TabView;
