import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';

import './styles.scss';

export enum AssignTrialResult {
	SUCCESS = 'success',
	FAILURE = 'failure',
}

const AssignTrialPlanStep: Step = function AssignTrialPlanStep( { navigation, data } ) {
	const { submit } = navigation;

	useEffect( () => {
		if ( submit ) {
			const assignTrialPlan = async () => {
				try {
					await wpcom.req.post(
						`/sites/${ data?.siteSlug }/ecommerce-trial/add/ecommerce-trial-bundle-monthly`,
						{
							apiVersion: '1.1',
						}
					);

					submit?.( { siteSlug: data?.siteSlug }, AssignTrialResult.SUCCESS );
				} catch ( err: any ) {
					submit?.( { siteSlug: data?.siteSlug }, AssignTrialResult.FAILURE );
				}
			};

			assignTrialPlan();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return null;
};

export default AssignTrialPlanStep;
