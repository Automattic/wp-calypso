import { useLocale } from '@automattic/i18n-utils';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import Main from 'calypso/components/main';
import wpcomRequest from 'wpcom-proxy-request';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';
import { getPatternSourceSiteID } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/constants';

import './style.scss';

export default ( { patterns }: { patterns: Pattern[] } ) => (
	<Main fullWidthLayout isLoggedOut>
		<div className="search-box-header">
			<h1 className="search-box-header__header">Build your perfect site with patterns</h1>
			<p className="search-box-header__subtitle">Hello logged-out users 👋</p>
		</div>

		<ul>
			{ patterns.map( ( pattern, index ) => (
				<li key={ index }>{ pattern.name }</li>
			) ) }
		</ul>
	</Main>
);
