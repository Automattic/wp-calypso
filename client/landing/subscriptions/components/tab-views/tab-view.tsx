import { Spinner } from '@wordpress/components';
import { Notice } from '../notice';
import './styles.scss';

type TabViewProps = {
	children: React.ReactNode;
	errorMessage?: string;
	isLoading?: boolean;
};

const TabView = ( { children, errorMessage, isLoading = false }: TabViewProps ) => {
	if ( errorMessage ) {
		return <Notice type="error">{ errorMessage }</Notice>;
	}

	if ( isLoading ) {
		return (
			<div className="loading-container">
				<Spinner />
			</div>
		);
	}

	return <>{ children }</>;
};

export default TabView;
