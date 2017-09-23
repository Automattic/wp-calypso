/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StatsContentText from '../stats-module/content-text';

const label = ( translate, period, yearsAgo, post ) => {
	const { URL: url, title } = post;
	const link = <a href={ url } target="_blank" rel="noopener noreferrer" />;
	if ( period.period === 'day' ) {
		return translate(
			'%(yearsAgo)d year ago on this day, {{href}}%(title)s{{/href}} was published.',
			'%(yearsAgo)d years ago on this day, {{href}}%(title)s{{/href}} was published.',
			{
				count: yearsAgo,
				args: { yearsAgo, title },
				components: { href: link },
				comment: 'Sentence showing what post was published some years ago on this day',
			},
		);
	}
	if ( period.period === 'week' ) {
		return translate(
			'%(yearsAgo)d year ago on this week, {{href}}%(title)s{{/href}} was published.',
			'%(yearsAgo)d years ago on this week, {{href}}%(title)s{{/href}} was published.',
			{
				count: yearsAgo,
				args: { yearsAgo, title },
				components: { href: link },
				comment: 'Sentence showing what post was published some years ago on this week',
			},
		);
	}
	if ( period.period === 'month' ) {
		return translate(
			'%(yearsAgo)d year ago on this month, {{href}}%(title)s{{/href}} was published.',
			'%(yearsAgo)d years ago on this month, {{href}}%(title)s{{/href}} was published.',
			{
				count: yearsAgo,
				args: { yearsAgo, title },
				components: { href: link },
				comment: 'Sentence showing what post was published some years ago on this month',
			},
		);
	}
	return '';
};

const SinglePost = localize( ( { translate, post, period } ) => {
	const yearsAgo = period.startOf
		.clone()
		.startOf( 'year' )
		.diff( moment( post.date ).startOf( 'year' ), 'years' );
	return (
		<StatsContentText>
			<p>
				<Gridicon icon="calendar" size={ 18 } />
				{ label( translate, period, yearsAgo, post ) }
			</p>
		</StatsContentText>
	);
} );

export default SinglePost;
