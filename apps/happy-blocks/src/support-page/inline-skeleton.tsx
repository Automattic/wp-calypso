import classnames from 'classnames';
import React from 'react';

type InlineSkeletonProps = {
	loaded: boolean;
	hidden?: boolean;
	large?: boolean;
	children: React.ReactNode;
};

export const InlineSkeleton = ( props: InlineSkeletonProps ) => {
	if ( props.loaded ) {
		return <>{ props.children }</>;
	}
	return (
		<span
			className={ classnames( 'hb-support-page-inline-skeleton', {
				'hb-support-page-inline-skeleton__hidden': props.hidden,
				'hb-support-page-inline-skeleton__large': props.large,
			} ) }
		></span>
	);
};
