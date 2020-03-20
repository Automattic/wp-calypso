/**
 * External dependencies
 */
import React, { FunctionComponent, useCallback, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { useLocalizedMoment } from 'components/localized-moment';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import Gridicon from 'components/gridicon';
import { getSelectedSiteId } from 'state/ui/selectors';
import { RewindFlowPurpose, defaultRewindConfig, RewindConfig } from './types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	rewindId?: string;
	purpose: RewindFlowPurpose;
}

const BackupRewindFlow: FunctionComponent< Props > = ( { rewindId, purpose } ) => {
	// const dispatch = useDispatch();
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );
	const rewindIdTimestamp: string = moment.unix( rewindId ).format( 'LLL' );

	const siteId = useSelector( getSelectedSiteId );

	const render = () => <div />;

	return (
		<Main className="rewind-flow">
			<DocumentHead
				title={
					purpose === RewindFlowPurpose.RESTORE ? translate( 'Restore' ) : translate( 'Download' )
				}
			/>
			<Card>
				<div className="rewind-flow__header">
					<Gridicon
						icon={ purpose === RewindFlowPurpose.RESTORE ? 'history' : 'cloud-download' }
						size={ 48 }
					/>
				</div>
				{ render() }
			</Card>
		</Main>
	);
};

export { RewindFlowPurpose, BackupRewindFlow as default };
