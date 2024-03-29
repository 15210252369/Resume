
let loadingRender = (function () {
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');

    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.png", "img/zf_cube2.png", "img/zf_cube3.png", "img/zf_cube4.png", "img/zf_cube5.png", "img/zf_cube6.png", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_emploment.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png", "img/zf_style1.jpg", "img/zf_style2.jpg", "img/zf_style3.jpg", "img/zf_styleTip1.png", "img/zf_styleTip2.png", "img/zf_teacher1.png", "img/zf_teacher2.png", "img/zf_teacher3.jpg", "img/zf_teacher4.png", "img/zf_teacher5.png", "img/zf_teacher6.png", "img/zf_teacherTip.png"];

    //=>RUN:预加载图片的
    let n = 0,
        len = imgData.length;
    let run = function run(callback) {
        imgData.forEach(item => {
            let tempImg = new Image;
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width', ((++n) / len) * 100 + '%');
                //=>加载完成:执行回调函数(让当前LOADING页面消失)
                if (n === len) {
                    clearTimeout(delayTimer);
                    callback && callback();
                }
            };
            tempImg.src = item;
        });
    };

    //=>MAX-DELAY:设置最长等待时间（假设10S，到达10S我们看加载多少了，如果已经达到了90%以上，我们可以正常访问内容了，如果不足这个比例，直接提示用户当前网络状况不佳，稍后重试）
    let delayTimer = null;
    let maxDelay = function maxDelay(callback) {
        delayTimer = setTimeout(() => {
            clearTimeout(delayTimer);
            if (n / len >= 0.9) {
                $current.css('width', '100%');
                callback && callback();
                return;
            }
            alert('非常遗憾，当前您的网络状况不佳，请稍后在试！');
            // window.location.href = 'http://www.qq.com';//=>此时我们不应该继续加载图片，而是让其关掉页面或者是跳转到其它页面
        }, 10000);
    };

    //=>DONE:完成
    let done = function done() {
        //=>停留一秒钟再移除进入下一环节
        let timer = setTimeout(() => {
            $loadingBox.remove();
            clearTimeout(timer)

            phoneRender.init();
        }, 1000);
    };

    return {
        init: function () {
            $loadingBox.css('display', 'block');
            run(done);
            maxDelay(done);
        }
    }
})();

/*PHONE*/
let phoneRender = (function () {
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];

    //=>点击ANSWER-MARK
    let answerMarkTouch = function answerMarkTouch() {
        //1.REMOVE ANSWER
        $answer.remove();
        answerBell.pause();
        $(answerBell).remove();//=>一定要先暂停播放然后再移除，否则即使移除了浏览器也会播放着这个声音

        //2.SHOW HANG
        $hang.css('transform', 'translateY(-1rem)');
        $time.css('display', 'block');
        introduction.play();
        computedTime();
    };

    //=>计算播放时间
    let autoTimer = null;
    let computedTime = function computedTime() {
        //=>我们让AUDIO播放,首先会去加载资源,部分资源加载完成才会播放,才会计算出总时间DURATION等信息,所以我们可以把获取信息放到CAN-PLAY事件中
        /*let duration = 0;
        introduction.oncanplay = function () {
            duration = introduction.duration;
        };*/
        autoTimer = setInterval(() => {
            let val = introduction.currentTime,
                duration = introduction.duration;
            //=>播放完成
            if (val >= duration) {
                clearInterval(autoTimer);
                closePhone();
                return;
            }
            let minute = Math.floor(val / 60),
                second = Math.floor(val - minute * 60);
            minute = minute < 10 ? '0' + minute : minute;
            second = second < 10 ? '0' + second : second;
            $time.html(`${minute}:${second}`);
        }, 1000);
    };

    //=>关闭PHONE
    let closePhone = function closePhone() {
        clearInterval(autoTimer);
        introduction.pause();
        $(introduction).remove();
        $phoneBox.remove();

        messageRender.init();
    };

    return {
        init: function () {
            $phoneBox.css('display', 'block');

            //=>播放BELL
            answerBell.play();
            answerBell.volume = 0.3;

            $answerMarkLink.tap(answerMarkTouch);
            $hangMarkLink.tap(closePhone);
        }
    }
})();

/*MESSAGE*/
let messageRender = (function () {
    let $messageBox = $('.messageBox'),
        $wrapper = $messageBox.find('.wrapper'),
        $messageList = $wrapper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit'),
        demonMusic = $('#demonMusic')[0];

    let step = -1,//=>记录当前展示信息的索引
        total = $messageList.length + 1,//=>记录的是信息总条数(自己发一条所以加1)
        autoTimer = null,
        interval = 1500;//=>记录信息相继出现的间隔时间

    //=>展示信息
    let tt = 0;
    let showMessage = function showMessage() {
        ++step;
        if (step === 2) {
            //=>已经展示两条了:此时我们暂时结束自动信息发送，让键盘出来，开始执行手动发送
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step);
        $cur.addClass('active');
        if (step >= 3) {
            //=>展示的条数已经是四条或者四条以上了,此时我们让WRAPPER向上移动(移动的距离是新展示这一条的高度)
            /*let curH = $cur[0].offsetHeight,
                wraT = parseFloat($wrapper.css('top'));
            $wrapper.css('top', wraT - curH);*/
            //=>JS中基于CSS获取TRANSFORM，得到的结果是一个矩阵
            let curH = $cur[0].offsetHeight;
            tt -= curH;
            $wrapper.css('transform', `translateY(${tt}px)`);
        }
        if (step >= total - 1) {
            //=>展示完了
            clearInterval(autoTimer);
            closeMessage();
        }
    };

    //=>手动发送
    let handleSend = function handleSend() {
        $keyBoard.css({
            transform: 'translateY(0)'
        }).one('transitionend', () => {
            //=>TRANSITION-END:监听当前元素TRASITION动画结束的事件(并且有几个样式属性改变，并且执行了过渡效果，事件就会被触发执行几次 =>用ONE方法做事件绑定,只会让其触发一次)
            let str = '好的，马上介绍！',
                n = -1,
                textTimer = null;
            textTimer = setInterval(() => {
                let orginHTML = $textInp.html();
                $textInp.html(orginHTML + str[++n]);
                if (n >= str.length - 1) {
                    //=>文字显示完成
                    clearInterval(textTimer);
                    $submit.css('display', 'block');
                }
            }, 100);
        });
    };

    //=>点击SUBMIT
    let handleSubmit = function handleSubmit() {
        //=>把新创建的LI增加到页面中第二个LI的后面
        $(`<li class="self">
            <i class="arrow"></i>
            <img src="img/zf_messageStudent.png" alt="" class="pic">
            ${$textInp.html()}
        </li>`).insertAfter($messageList.eq(1)).addClass('active');
        $messageList = $wrapper.find('li');//=>重要:把新的LI放到页面中,我们此时应该重新获取LI，让MESSAGE-LIST和页面中的LI正对应，方便后期根据索引展示对应的LI

        //=>该消失的消失
        $textInp.html('');
        $submit.css('display', 'none');
        $keyBoard.css('transform', 'translateY(3.7rem)');

        //=>继续向下展示剩余的消息
        autoTimer = setInterval(showMessage, interval);
    };

    //=>关掉MESSAGE区域
    let closeMessage = function closeMessage() {
        let delayTimer = setTimeout(() => {
            demonMusic.pause();
            $(demonMusic).remove();
            $messageBox.remove();
            clearTimeout(delayTimer);

            cubeRender.init()
        }, 2000);
    };

    return {
        init: function () {
            $messageBox.css('display', 'block');

            //=>加载模块立即展示一条信息,后期间隔INTERVAL在发送一条信息
            showMessage();
            autoTimer = setInterval(showMessage, interval);

            //=>SUBMIT
            $submit.tap(handleSubmit);

            //=>MUSIC
            demonMusic.play();
            demonMusic.volume = 0.3;
        }
    }
})();

//魔方
let cubeRender = (function () {
    let $cubeBox = $('.cubeBox')
    let $cube = $('.cube')
    let $cubeList = $cube.find('li')

    let start = function (e) {
        let point = e.changedTouches[0]//在移动端获得事件源 
        this.strX = point.clientX
        this.strY = point.clientY
        this.changeX = 0
        this.changeY = 0
    }
    let move = function (e) {
        let point = e.changedTouches[0]
        //用最新手指位置减去初始位置，记录X,Y偏移
        this.changeX = point.clientX - this.strX
        this.changeY = point.clientY - this.strY

    }
    let end = function (e) {
        let { changeX, changeY, rotateX, rotateY } = this
        isMove = false
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        if (isMove) {
            rotateY = rotateY + changeX / 3
            rotateX = rotateX - changeY / 3
            $(this).css('transform', `scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`)
            this.rotateX = rotateX
            this.rotateY = rotateY
        }
    }
    return {
        init: function () {
            $cubeBox.css('display', 'block')
            let cube = $cube[0]
            cube.rotateX = -35
            cube.rotateY = 35
            $cube.on('touchstart', start).on('touchmove', move).on('touchend', end)

            //点击页面跳转到详情页面
            $cubeList.tap(function () {
                $cubeBox.css('display', 'none')
                let index = $(this).index()
                detailRender.init(index)
            })

        }
    }
})()

//detail
let detailRender = (function () {
    let $detailBox = $('.detailBox')
    let $dl = $('.page1>dl')
    let swiper = null
    let swiperInit = function () {
        swiper = new Swiper('.swiper-container', {
            effect: 'coverflow',
            onInit: move,
            onTransitionEnd: move
        })
    }

    let move = function (swiper) {
        let activeIn = swiper.activeIndex
        let slideList = swiper.slides
        if (activeIn === 0) {
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0.8
            })
            $dl.makisu('toggle')
        } else {
            $dl.makisu({
                selector: 'dd',
                overlap: 0.6,
                speed: 0
            })
            $dl.makisu('close')
        }
        //滑动到哪个页面,把当前页面设置对应id,其余页面移除Id
        Array.prototype.slice.call(slideList).forEach((item, index) => {
            if (activeIn === index) {
                item.id = `page${index + 1}`
                return
            }
            item.id = null
        })
    }
    return {
        init: function (index = 0) {
            $detailBox.css('display', 'block')
            if (!swiper) {
                swiperInit()
            }

            swiper.slideTo(index, 0)
        }
    }
})()

var startY, endY;
//记录手指触摸的起点坐标
$('body').on('touchstart', function (e) {
    startY = e.touches[0].pageY;
});
$('body').on('touchmove', function (e) {
    endY = e.touches[0].pageY;  //记录手指触摸的移动中的坐标
    //手指下滑，页面到达顶端不能继续下滑
    if (endY > startY && $(window).scrollTop() <= 0) {
        e.preventDefault();
    }
    //手指上滑，页面到达底部能继续上滑
    if (endY < startY && $(window).scrollTop() +
        $(window).height() >= $('body')[0].scrollHeight) {
        e.preventDefault();
    }
})

let url = window.location.href;
let well = url.indexOf('#')
let hash = well === -1 ? null : url.substr(well + 1)


switch (hash) {
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    default:
        loadingRender.init();
    case 'cube':
        cubeRender.init();
    case 'detail':
        detailRender.init()

}