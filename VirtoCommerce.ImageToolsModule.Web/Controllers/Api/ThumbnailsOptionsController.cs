﻿using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using VirtoCommerce.ImageToolsModule.Core.Models;
using VirtoCommerce.ImageToolsModule.Core.Services;
using VirtoCommerce.ImageToolsModule.Web.Models;
using VirtoCommerce.ImageToolsModule.Web.Security;
using VirtoCommerce.Platform.Core.Web.Security;

namespace VirtoCommerce.ImageToolsModule.Web.Controllers.Api
{
    /// <summary>
    /// Thumbnails options controller
    /// </summary>
    [RoutePrefix("api/image/thumbnails/options")]
    public class ThumbnailsOptionsController : ApiController
    {
        private readonly IThumbnailOptionService _thumbnailOptionService;
        private readonly IThumbnailOptionSearchService _thumbnailOptionSearchService;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="thumbnailOptionService"></param>
        /// <param name="thumbnailOptionSearchService"></param>
        public ThumbnailsOptionsController(IThumbnailOptionService thumbnailOptionService, IThumbnailOptionSearchService thumbnailOptionSearchService)
        {
            _thumbnailOptionService = thumbnailOptionService;
            _thumbnailOptionSearchService = thumbnailOptionSearchService;
        }

        /// <summary>
        /// Creates thumbnail option
        /// </summary>
        /// <param name="option">thumbnail option</param>
        /// <returns></returns>
        [HttpPost]
        [Route("")]
        [ResponseType(typeof(ThumbnailOption))]
        [CheckPermission(Permission = ThumbnailPredefinedPermissions.Create)]
        public IHttpActionResult Create(ThumbnailOption option)
        {
            _thumbnailOptionService.SaveOrUpdate(new[] { option });
            return Ok(option);
        }

        /// <summary>
        /// Remove thumbnail options by ids
        /// </summary>
        /// <param name="ids">options ids</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("")]
        [ResponseType(typeof(void))]
        [CheckPermission(Permission = ThumbnailPredefinedPermissions.Delete)]
        public IHttpActionResult Delete([FromUri] string[] ids)
        {
            _thumbnailOptionService.RemoveByIds(ids);
            return StatusCode(HttpStatusCode.NoContent);
        }

        /// <summary>
        /// Gets thumbnail options
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        [HttpGet]
        [Route("{id}")]
        [ResponseType(typeof(ThumbnailOption))]
        [CheckPermission(Permission = ThumbnailPredefinedPermissions.Read)]
        public IHttpActionResult Get(string id)
        {
            var options = _thumbnailOptionService.GetByIds(new[] { id });
            return Ok(options.FirstOrDefault());
        }

        /// <summary>
        /// Searches thumbnail options
        /// </summary>
        /// <param name="criteria">Search criteria</param>
        /// <returns></returns>
        [HttpPost]
        [Route("search")]
        [ResponseType(typeof(SearchResult<ThumbnailOption>))]
        [CheckPermission(Permission = ThumbnailPredefinedPermissions.Read)]
        public SearchResult<ThumbnailOption> Search(ThumbnailOptionSearchCriteria criteria)
        {
            var result = _thumbnailOptionSearchService.Search(criteria);

            var searchResult = new SearchResult<ThumbnailOption>
            {
                Result = result.Results.ToArray(),
                TotalCount = result.TotalCount
            };

            return searchResult;
        }

        /// <summary>
        /// Updates thumbnail options
        /// </summary>
        /// <param name="option">Thumbnail options</param>
        /// <returns></returns>
        [HttpPut]
        [Route("")]
        [ResponseType(typeof(void))]
        [CheckPermission(Permission = ThumbnailPredefinedPermissions.Update)]
        public IHttpActionResult Update(ThumbnailOption option)
        {
            _thumbnailOptionService.SaveOrUpdate(new[] { option });
            return StatusCode(HttpStatusCode.NoContent);
        }
    }
}