import {
	__experimentalNavigatorScreen as BaseNavigatorScreen,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import type { ComponentProps } from 'react';

type Props = ComponentProps< typeof BaseNavigatorScreen > & {
	partialMatch?: boolean;
};

/**
 * A wrapper of the NavigatorScreen to support matching the path partially.
 */
const NavigatorScreen = ( { partialMatch, ...props }: Props ) => {
	const { location } = useNavigator();

	if ( partialMatch && location.path?.startsWith( props.path ) ) {
		return props.children;
	}

	return <BaseNavigatorScreen { ...props } />;
};

export default NavigatorScreen;
