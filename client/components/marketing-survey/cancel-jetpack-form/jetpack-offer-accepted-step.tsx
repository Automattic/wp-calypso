import * as React from 'react';

interface Props {
	siteId: number;
	offer: object;
}

const JetpackOfferAcceptedStep: React.FC< Props > = ( props ) => {
	const { siteId } = props;
	return <p data-site={ siteId }>Offer accepted</p>;
};

export default JetpackOfferAcceptedStep;
