import { SiteOptions } from './site-options';
import type { Step } from '../../types';
import './style.scss';

const SiteOptionsStepRouter: Step = function SiteOptionsStepRouter( { navigation } ) {
	return <SiteOptions navigation={ navigation } />;
};

export default SiteOptionsStepRouter;
