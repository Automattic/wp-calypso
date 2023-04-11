import { Spinner } from '@wordpress/components';
import { Notice } from '../notice';
import './styles.scss';

type TabViewProps = {
	children: JSX.Element;
	errorMessage: string;
	isLoading: boolean;
};

const TabView = ( { children, errorMessage, isLoading }: TabViewProps ) => {
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

	return children;
};

export default TabView;
