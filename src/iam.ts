/*!
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {BodyResponseCallback, DecorateRequestOptions} from '@google-cloud/common';
import {promisifyAll} from '@google-cloud/promisify';
import arrify = require('arrify');
import * as r from 'request';

import {Bucket} from './bucket';
import {normalize} from './util';

/**
 * @typedef {object} GetPolicyOptions
 * @property {string} [userProject] The ID of the project which will be billed for
 *     the request.
 */
export interface GetPolicyOptions {
  userProject?: string;
}

/**
 * @typedef {array} GetPolicyResponse
 * @property {object} 0 The policy.
 * @property {object} 1 The full API response.
 */
export type GetPolicyResponse = [Policy, r.Response];

/**
 * @callback GetPolicyCallback
 * @param {?Error} err Request error, if any.
 * @param {object} acl The policy.
 * @param {object} apiResponse The full API response.
 */
export interface GetPolicyCallback {
  (err?: Error|null, acl?: Policy, apiResponse?: r.Response): void;
}

/**
 * @typedef {object} SetPolicyOptions
 * @param {string} [userProject] The ID of the project which will be
 *     billed for the request.
 */
export interface SetPolicyOptions {
  userProject?: string;
}

/**
 * @typedef {array} SetPolicyResponse
 * @property {object} 0 The policy.
 * @property {object} 1 The full API response.
 */
export type SetPolicyResponse = [Policy, r.Response];

/**
 * @callback SetPolicyCallback
 * @param {?Error} err Request error, if any.
 * @param {object} acl The policy.
 * @param {object} apiResponse The full API response.
 */
export interface SetPolicyCallback {
  (err?: Error|null, acl?: Policy, apiResponse?: object): void;
}

/**
 * @typedef {object} Policy
 * @property {array} policy.bindings Bindings associate members with roles.
 * @property {string} [policy.etag] Etags are used to perform a read-modify-write.
 */
export interface Policy {
  bindings: PolicyBinding[];
  etag?: string;
}

export interface PolicyBinding {
  role: string;
  members: string[];
}

/**
 * @typedef {array} TestIamPermissionsResponse
 * @property {object} 0 A subset of permissions that the caller is allowed.
 * @property {object} 1 The full API response.
 */
export type TestIamPermissionsResponse = [{[key: string]: boolean}, r.Response];

/**
 * @callback TestIamPermissionsCallback
 * @param {?Error} err Request error, if any.
 * @param {object} acl A subset of permissions that the caller is allowed.
 * @param {object} apiResponse The full API response.
 */
export interface TestIamPermissionsCallback {
  (err?: Error|null, acl?: {[key: string]: boolean}|null,
   apiResponse?: r.Response): void;
}

/**
 * @typedef {object} TestIamPermissionsOptions Configuration options for Iam#testPermissions().
 * @param {string} [userProject] The ID of the project which will be
 *     billed for the request.
 */
export interface TestIamPermissionsOptions {
  userProject?: string;
}


/**
 * Get and set IAM policies for your Cloud Storage bucket.
 *
 * @see [Cloud Storage IAM Management](https://cloud.google.com/storage/docs/access-control/iam#short_title_iam_management)
 * @see [Granting, Changing, and Revoking Access](https://cloud.google.com/iam/docs/granting-changing-revoking-access)
 * @see [IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
 *
 * @constructor Iam
 * @mixin
 *
 * @param {Bucket} bucket The parent instance.
 * @example
 * const {Storage} = require('@google-cloud/storage');
 * const storage = new Storage();
 * const bucket = storage.bucket('my-bucket');
 * // bucket.iam
 */
class Iam {
  private request_:
      (reqOpts: DecorateRequestOptions, callback: BodyResponseCallback) => void;
  private resourceId_: string;

  constructor(bucket: Bucket) {
    this.request_ = bucket.request.bind(bucket);
    this.resourceId_ = 'buckets/' + bucket.getId();
  }

  getPolicy(options?: GetPolicyOptions): Promise<GetPolicyResponse>;
  getPolicy(options: GetPolicyOptions, callback: GetPolicyCallback): void;
  getPolicy(callback: GetPolicyCallback): void;
  /**
   * Get the IAM policy.
   *
   * @param {GetPolicyRequest} [options] Request options.
   * @param {GetPolicyCallback} [callback] Callback function.
   * @returns {Promise<GetPolicyResponse>}
   *
   * @see [Buckets: setIamPolicy API Documentation]{@link https://cloud.google.com/storage/docs/json_api/v1/buckets/getIamPolicy}
   *
   * @example
   * const {Storage} = require('@google-cloud/storage');
   * const storage = new Storage();
   * const bucket = storage.bucket('my-bucket');
   * bucket.iam.getPolicy(function(err, policy, apiResponse) {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * bucket.iam.getPolicy().then(function(data) {
   *   const policy = data[0];
   *   const apiResponse = data[1];
   * });
   *
   * @example <caption>include:samples/iam.js</caption>
   * region_tag:storage_view_bucket_iam_members
   * Example of retrieving a bucket's IAM policy:
   */
  getPolicy(
      optionsOrCallback?: GetPolicyOptions|GetPolicyCallback,
      callback?: GetPolicyCallback): Promise<GetPolicyResponse>|void {
    const {options, callback: cb} =
        normalize<GetPolicyOptions, GetPolicyCallback>(
            optionsOrCallback, callback);

    this.request_(
        {
          uri: '/iam',
          qs: options,
        },
        cb!);
  }

  setPolicy(policy: Policy, options?: SetPolicyOptions):
      Promise<SetPolicyResponse>;
  setPolicy(policy: Policy, callback: SetPolicyCallback): void;
  setPolicy(
      policy: Policy, options: SetPolicyOptions,
      callback: SetPolicyCallback): void;
  /**
   * Set the IAM policy.
   *
   * @throws {Error} If no policy is provided.
   *
   * @param {Policy} policy The policy.
   * @param {SetPolicyOptions} [options] Configuration opbject.
   * @param {SetPolicyCallback} callback Callback function.
   * @returns {Promise<SetPolicyResponse>}
   *
   * @see [Buckets: setIamPolicy API Documentation]{@link https://cloud.google.com/storage/docs/json_api/v1/buckets/setIamPolicy}
   * @see [IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
   *
   * @example
   * const {Storage} = require('@google-cloud/storage');
   * const storage = new Storage();
   * const bucket = storage.bucket('my-bucket');
   *
   * const myPolicy = {
   *   bindings: [
   *     {
   *       role: 'roles/storage.admin',
   *       members:
   * ['serviceAccount:myotherproject@appspot.gserviceaccount.com']
   *     }
   *   ]
   * };
   *
   * bucket.iam.setPolicy(myPolicy, function(err, policy, apiResponse) {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * bucket.iam.setPolicy(myPolicy).then(function(data) {
   *   const policy = data[0];
   *   const apiResponse = data[1];
   * });
   *
   * @example <caption>include:samples/iam.js</caption>
   * region_tag:storage_add_bucket_iam_member
   * Example of adding to a bucket's IAM policy:
   *
   * @example <caption>include:samples/iam.js</caption>
   * region_tag:storage_remove_bucket_iam_member
   * Example of removing from a bucket's IAM policy:
   */
  setPolicy(
      policy: Policy, optionsOrCallback?: SetPolicyOptions|SetPolicyCallback,
      callback?: SetPolicyCallback): Promise<SetPolicyResponse>|void {
    if (policy === null || typeof policy !== 'object') {
      throw new Error('A policy object is required.');
    }

    const {options, callback: cb} =
        normalize<SetPolicyOptions, SetPolicyCallback>(
            optionsOrCallback, callback);

    this.request_(
        {
          method: 'PUT',
          uri: '/iam',
          json: Object.assign(
              {
                resourceId: this.resourceId_,
              },
              policy),
          qs: options,
        },
        cb);
  }

  testPermissions(
      permissions: string|string[],
      options?: TestIamPermissionsOptions): Promise<TestIamPermissionsResponse>;
  testPermissions(
      permissions: string|string[], callback: TestIamPermissionsCallback): void;
  testPermissions(
      permissions: string|string[], options: TestIamPermissionsOptions,
      callback: TestIamPermissionsCallback): void;
  /**
   * Test a set of permissions for a resource.
   *
   * @throws {Error} If permissions are not provided.
   *
   * @param {string|string[]} permissions The permission(s) to test for.
   * @param {TestIamPermissionsOptions} [options] Configuration object.
   * @param {TestIamPermissionsCallback} [callback] Callback function.
   * @returns {Promise<TestIamPermissionsResponse>}
   *
   * @see [Buckets: testIamPermissions API Documentation]{@link https://cloud.google.com/storage/docs/json_api/v1/buckets/testIamPermissions}
   *
   * @example
   * const {Storage} = require('@google-cloud/storage');
   * const storage = new Storage();
   * const bucket = storage.bucket('my-bucket');
   *
   * //-
   * // Test a single permission.
   * //-
   * const test = 'storage.buckets.delete';
   *
   * bucket.iam.testPermissions(test, function(err, permissions, apiResponse) {
   *   console.log(permissions);
   *   // {
   *   //   "storage.buckets.delete": true
   *   // }
   * });
   *
   * //-
   * // Test several permissions at once.
   * //-
   * const tests = [
   *   'storage.buckets.delete',
   *   'storage.buckets.get'
   * ];
   *
   * bucket.iam.testPermissions(tests, function(err, permissions) {
   *   console.log(permissions);
   *   // {
   *   //   "storage.buckets.delete": false,
   *   //   "storage.buckets.get": true
   *   // }
   * });
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * bucket.iam.testPermissions(test).then(function(data) {
   *   const permissions = data[0];
   *   const apiResponse = data[1];
   * });
   */
  testPermissions(
      permissions: string|string[],
      optionsOrCallback?: TestIamPermissionsOptions|TestIamPermissionsCallback,
      callback?: TestIamPermissionsCallback):
      Promise<TestIamPermissionsResponse>|void {
    if (!Array.isArray(permissions) && typeof permissions !== 'string') {
      throw new Error('Permissions are required.');
    }

    const {options, callback: cb} =
        normalize<TestIamPermissionsOptions, TestIamPermissionsCallback>(
            optionsOrCallback, callback);

    const permissionsArray = arrify(permissions);

    const req = Object.assign(
        {
          permissions: permissionsArray,
        },
        options);

    this.request_(
        {
          uri: '/iam/testPermissions',
          qs: req,
          useQuerystring: true,
        },
        (err, resp) => {
          if (err) {
            cb!(err, null, resp);
            return;
          }

          const availablePermissions = arrify(resp.permissions);

          const permissionsHash = permissionsArray.reduce(
              (acc: {[index: string]: boolean}, permission) => {
                acc[permission] = availablePermissions.indexOf(permission) > -1;
                return acc;
              },
              {});

          cb!(null, permissionsHash, resp);
        });
  }
}

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(Iam);

export {Iam};
