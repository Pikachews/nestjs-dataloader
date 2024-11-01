import request from 'supertest'
import Dataloader from 'dataloader'
import { describe } from 'vitest'
import { Controller, Get, Injectable } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test } from '@nestjs/testing'
import { DataloaderModule, DataloaderFactory, type LoaderFrom, Loader } from '../src'

describe('@Loader()', it => {
  it('injects the dataloader instance into the request handler', async t => {
    @Injectable()
    class SampleLoaderFactory extends DataloaderFactory<unknown, unknown> {
      load = async (keys: unknown[]) => await Promise.resolve(keys)
      id = (key: unknown) => key
    }

    @Controller()
    class TestController {
      @Get('/')
      handle(@Loader(SampleLoaderFactory) loader: LoaderFrom<SampleLoaderFactory>) {
        t.expect(loader).toBeInstanceOf(Dataloader)
      }
    }

    const module = await Test.createTestingModule({
      imports: [
        DataloaderModule.forRoot(),
        DataloaderModule.forFeature([SampleLoaderFactory]),
      ],
      controllers: [TestController],
      exports: [DataloaderModule],
    }).compile()
    const app = await module.createNestApplication<NestExpressApplication>().init()
    t.onTestFinished(async () => await app.close())

    await request(app.getHttpServer()).get('/')
  })
})
