import { createRef } from 'react';

// jsdom doesn't mock the IntersectionObserver API used by react-intersection-observer
export function useInView() {
	return {
		ref: createRef(),
		inView: true,
	};
}
