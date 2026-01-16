import { __experimentalVStack as VStack } from '@wordpress/components';
import './style.scss';

export const QuickPostSkeleton = () => {
	return (
		<VStack className="quick-post-skeleton" spacing={ 4 }>
			<span className="is-placeholder" style={ { width: '60px', height: '54px' } }></span>
			<span className="is-placeholder" style={ { width: '100%', height: '136px' } }></span>
			<span className="is-placeholder" style={ { width: '100%', height: '36px' } }></span>
		</VStack>
	);
};
