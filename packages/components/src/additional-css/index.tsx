import React, { useState, useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';
import { useAdditionalCss } from 'calypso/data/additional-css/use-additional-css';
import { useQuery } from '@apollo/client';
import { getAdditionalCssQuery } from 'calypso/data/additional-css/queries';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import { getSiteTitle } from 'calypso/state/sites/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { getSitePostCount } from 'calypso/state/sites/selectors';
import { getSitePageCount } from 'calypso/state/sites/selectors';
import { getSiteCommentCount } from 'calypso/state/sites/selectors';
import { getSitePostTypes } from 'calypso/state/sites/selectors';
import { getSitePageTypes } from 'calypso/state/sites/selectors';
import { getSiteCommentTypes } from 'calypso/state/sites/selectors';

const AdditionalCss = () => {
  const translate = useTranslate();
  const siteId = getSelectedSiteId();
  const siteSlug = getSiteSlug( siteId );
  const siteUrl = getSiteUrl( siteId );
  const siteTitle = getSiteTitle( siteId );
  const siteAdminUrl = getSiteAdminUrl( siteId );
  const siteHomeUrl = getSiteHomeUrl( siteId );
  const sitePostCount = getSitePostCount( siteId );
  const sitePageCount = getSitePageCount( siteId );
  const siteCommentCount = getSiteCommentCount( siteId );
  const sitePostTypes = getSitePostTypes( siteId );
  const sitePageTypes = getSitePageTypes( siteId );
  const siteCommentTypes = getSiteCommentTypes( siteId );

  const { data, error, loading } = useQuery( getAdditionalCssQuery, {
    variables: { siteId },
  } );

  const [ css, setCss ] = useState( '' );

  useEffect( () => {
    if ( data && data.additionalCss ) {
      setCss( data.additionalCss.css );
    }
  }, [ data ] );

  if ( loading ) {
    return <div>{ translate( 'Loading...' ) }</div>;
  }

  if ( error ) {
    return <div>{ translate( 'Error loading additional CSS.' ) }</div>;
  }

  return (
    <Card>
      <div className="additional-css">
        <h2>{ translate( 'Additional CSS' ) }</h2>
        <textarea
          value={ css }
          onChange={ ( event ) => setCss( event.target.value ) }
          placeholder={ translate( 'Enter your custom CSS here...' ) }
        />
        <button
          onClick={ () => {
            // Save the CSS
            console.log( 'Save CSS' );
          } }
        >
          { translate( 'Save' ) }
        </button>
      </div>
    </Card>
  );
};

export default AdditionalCss;