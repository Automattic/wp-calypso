/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ReactNode } from 'react';

declare module 'calypso/components/async-load' {
	interface AsyncLoadProps {
		placeholder?: ReactNode;
		require: any;
		[ key: string ]: any;
	}

	export default class AsyncLoad extends Component< AsyncLoadProps, { component: any | null } > {
		static propTypes: {
			placeholder: PropTypes.node;
			require: PropTypes.func.isRequired;
		};
		static defaultProps: {
			placeholder: ReactNode;
		};
	}
}
