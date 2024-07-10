import { beforeEach, describe, expect, test } from 'vitest';
import {
  EphemeralAddressRequest,
  EphemeralAddressResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { createContextValues, createHandlerContext, HandlerContext } from '@connectrpc/connect';
import { ViewService } from '@penumbra-zone/protobuf';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { ephemeralAddress } from './ephemeral-address.js';
import { testFullViewingKey } from '../test-utils.js';
import { fvkCtx } from '../ctx/full-viewing-key.js';

describe('EphemeralAddress request handler', () => {
  let mockCtx: HandlerContext;

  beforeEach(() => {
    mockCtx = createHandlerContext({
      service: ViewService,
      method: ViewService.methods.ephemeralAddress,
      protocolName: 'mock',
      requestMethod: 'MOCK',
      url: '/mock',
      contextValues: createContextValues().set(fvkCtx, () => Promise.resolve(testFullViewingKey)),
    });
  });

  test('should successfully get EphemeralAddress', async () => {
    const ephemeralAddressResponse = await ephemeralAddress(
      new EphemeralAddressRequest({ addressIndex: { account: 0 } }),
      mockCtx,
    );
    expect(ephemeralAddressResponse.address).toBeInstanceOf(Address);
  });

  test('should get an error if addressIndex is missing', async () => {
    await expect(ephemeralAddress(new EphemeralAddressRequest(), mockCtx)).rejects.toThrow(
      'Missing address index',
    );
  });

  test('addresses with different indexes should be different', async () => {
    const ephemeral1Response = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 1 } }),
        mockCtx,
      ),
    );
    const ephemeral2Response = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 2 } }),
        mockCtx,
      ),
    );
    expect(ephemeral1Response.address?.equals(ephemeral2Response.address)).toBeFalsy();
  });

  test('addresses with same indexes should be different', async () => {
    const ephemeralFirst = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 3 } }),
        mockCtx,
      ),
    );
    const ephemeralSecond = new EphemeralAddressResponse(
      await ephemeralAddress(
        new EphemeralAddressRequest({ addressIndex: { account: 3 } }),
        mockCtx,
      ),
    );
    expect(ephemeralFirst.address?.equals(ephemeralSecond.address)).toBeFalsy();
  });
});
