import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { ForwardedRef, forwardRef } from 'react';
import { BASIC_METRICS_UNITS } from 'calypso/data/site-profiler/metrics-dictionaries';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import type { BasicMetrics as BasicMetricsType } from 'calypso/data/site-profiler/types';

const Container = styled.div`
	scroll-margin-top: calc(
		64px + ${ ( props: { isLoggedIn: boolean } ) => ( props.isLoggedIn ? '32px' : '0px' ) }
	); // add the topbar height when the user is logged in
`;

export const BasicMetrics = forwardRef(
	(
		{ basicMetrics }: { basicMetrics: BasicMetricsType },
		ref: ForwardedRef< HTMLObjectElement >
	) => {
		const isLoggedIn = useSelector( isUserLoggedIn );

		return (
			<Container className="basic-metrics" ref={ ref } isLoggedIn={ isLoggedIn }>
				<h3>{ translate( 'Basic Performance Metrics' ) }</h3>
				<ul className="basic-metric-details result-list">
					{ Object.entries( basicMetrics ).map( ( [ key, value ] ) => {
						return (
							<li key={ key }>
								<div className="name">
									<a href={ `https://web.dev/articles/${ key }` }>{ key }</a>
								</div>
								<div>
									{ value } { BASIC_METRICS_UNITS[ key ] }
								</div>
							</li>
						);
					} ) }
				</ul>
			</Container>
		);
	}
);
