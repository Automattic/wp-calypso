import { __experimentalVStack as VStack } from '@wordpress/components';
import './style.scss';

export function QuickPostSkeleton(): JSX.Element {
	return (
		<VStack className="quick-post-skeleton" spacing={ 4 }>
			<span style={ { width: '60px', height: '54px' } }></span>
			<span style={ { width: '100%', height: '136px' } }></span>
			<span style={ { width: '100%', height: '36px' } }></span>
		</VStack>
	);
}
