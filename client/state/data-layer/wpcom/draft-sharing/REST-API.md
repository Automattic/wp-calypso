# Overview

This document describes the REST API for the Share a Draft feature.

# Schema

## DraftSharing

| Name				| Type		| Description									|
| ----------------- | --------- | --------------------------------------------- |
| is_enabled		| boolean	| Indicates whether or not sharing is enabled.	|
| link				| URL		| A URL to review a draft. Read only.			|

# Endpoints

## Get sharing configuration

URI: `/sites/<site-id>/posts/<post-id>/draft-sharing`

Method: `GET`

### Response body

```json
{
	"is_enabled": true,
	"link": "https://example.com?p=123&draft-sharing=<id>",
}
```

## Create sharing configuration

URI: `/sites/<site-id>/posts/<post-id>/draft-sharing`

Method: `POST`

### Request body

None

### Response body

```json
{
	"is_enabled": true,
	"link": "https://example.com?p=123&draft-sharing=<id>",
}
```

## Enable or disable draft sharing

URI: `/sites/<site-id>/posts/<post-id>/draft-sharing`

Method: `PATCH`

### Request body

```json
{
	"is_enabled": false
}
```

### Response body

None
